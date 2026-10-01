"use client";

import type { CartWithItems } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    if (res.status === 401) {
      router.push("/auth/signin?callbackUrl=/cart");
      return;
    }
    if (!res.ok) {
      setError("Failed to load cart");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { cart: CartWithItems };
    setCart(data.cart);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItemId, quantity }),
    });

    if (res.ok) {
      await fetchCart();
    } else {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Failed to update item");
    }

    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
  };

  const removeItem = async (cartItemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(cartItemId));

    const res = await fetch(`/api/cart?itemId=${cartItemId}`, { method: "DELETE" });

    if (res.ok) {
      await fetchCart();
    } else {
      setError("Failed to remove item");
    }

    setUpdatingItems((prev) => {
      const next = new Set(prev);
      next.delete(cartItemId);
      return next;
    });
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError(null);

    const res = await fetch("/api/checkout", { method: "POST" });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Checkout failed. Please try again.");
      setCheckoutLoading(false);
      return;
    }

    const data = (await res.json()) as { url: string };
    window.location.href = data.url;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = !cart || cart.cartItems.length === 0;
  const subtotal = cart
    ? cart.cartItems.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Your Cart</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button className="ml-2 underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {isEmpty ? (
        <div className="text-center py-20">
          <svg
            className="w-20 h-20 text-gray-300 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Add some products to get started.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border border-gray-200 p-4 flex gap-4 transition-opacity ${
                    isUpdating ? "opacity-50" : ""
                  }`}
                >
                  <Link href={`/products/${item.productId}`} className="shrink-0">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.productId}`}>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{item.product.category}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ${Number(item.product.price).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= item.product.stock}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={isUpdating}
                        className="text-xs text-red-500 hover:text-red-700 mt-1 disabled:opacity-40 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4 text-sm text-gray-600">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="shrink-0 font-medium text-gray-900">
                      ${(Number(item.product.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Taxes and shipping calculated at checkout</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {checkoutLoading ? "Redirecting to checkout..." : "Proceed to Checkout"}
              </button>

              <Link
                href="/"
                className="block text-center text-sm text-blue-600 hover:text-blue-700 mt-4"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
