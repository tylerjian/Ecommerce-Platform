import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend";
import { stripe } from "@/lib/stripe";

// Disable Next.js body parsing — Stripe needs the raw body to verify the signature
export const config = { api: { bodyParser: false } };

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId in metadata" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Mark order as PAID and persist the Stripe session ID
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        stripeSessionId: session.id,
      },
    });

    // Decrement stock for each ordered product
    await Promise.all(
      order.orderItems.map((item) =>
        prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );

    // Clear the buyer's cart
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: order.userId } },
    });

    // Send confirmation email (non-blocking — log failures but don't error)
    if (order.user.email) {
      const orderId8 = order.id.slice(-8).toUpperCase();
      try {
        await resend.emails.send({
          from: "ShopNext <onboarding@resend.dev>",
          to: order.user.email,
          subject: `Order Confirmed — #${orderId8}`,
          react: OrderConfirmationEmail({ order }),
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
