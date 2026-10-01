import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartItemSchema, updateCartItemSchema } from "@/lib/validations";

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: { cartItems: { include: { product: true } } },
  });
}

// GET /api/cart — fetch the current user's cart
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await getOrCreateCart(session.user.id);
  return NextResponse.json({ cart });
}

// POST /api/cart — add item to cart
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  const parsed = cartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.stock < quantity) {
    return NextResponse.json({ error: `Only ${product.stock} in stock` }, { status: 400 });
  }

  const cart = await getOrCreateCart(session.user.id);

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} in stock` }, { status: 400 });
    }
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/cart — update item quantity (0 = remove)
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { cartItemId, quantity } = parsed.data;

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  if (quantity === 0) {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
  } else {
    const product = await prisma.product.findUnique({ where: { id: cartItem.productId } });
    if (product && quantity > product.stock) {
      return NextResponse.json({ error: `Only ${product.stock} in stock` }, { status: 400 });
    }
    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/cart?itemId=xxx — remove a specific item
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cartItemId = searchParams.get("itemId");

  if (!cartItemId) {
    return NextResponse.json({ error: "cartItemId is required" }, { status: 400 });
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== session.user.id) {
    return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: cartItemId } });
  return NextResponse.json({ success: true });
}
