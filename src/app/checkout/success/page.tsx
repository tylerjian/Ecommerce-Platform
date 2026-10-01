import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

interface CheckoutSuccessPageProps {
  searchParams: { session_id?: string };
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  const { session_id } = searchParams;

  if (!session_id) {
    redirect("/");
  }

  // Retrieve the Stripe session to confirm payment
  let stripeSession;
  try {
    stripeSession = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    redirect("/orders");
  }

  // Find the matching order
  const order = await prisma.order.findUnique({
    where: { stripeSessionId: stripeSession.id },
    include: {
      orderItems: { include: { product: true } },
    },
  });

  // If order belongs to a different user, redirect away
  if (!order || order.userId !== session.user.id) {
    redirect("/orders");
  }

  const orderId8 = order.id.slice(-8).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg
          className="w-10 h-10 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Order Confirmed!</h1>
      <p className="text-gray-600 mb-2">
        Thank you for your purchase. We&apos;ve sent a confirmation email to{" "}
        <span className="font-medium text-gray-800">{session.user.email}</span>.
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Order ID: <span className="font-bold text-blue-600">#{orderId8}</span>
      </p>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left mb-8">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Order Summary</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × ${Number(item.price).toFixed(2)}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-bold text-lg text-gray-900">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/orders"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          View All Orders
        </Link>
        <Link
          href="/"
          className="inline-block bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
