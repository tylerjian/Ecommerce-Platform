import type { Cart, CartItem, Order, OrderItem, Product, User } from "@prisma/client";

export type CartWithItems = Cart & {
  cartItems: (CartItem & {
    product: Product;
  })[];
};

export type OrderWithItems = Order & {
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

export type OrderWithUserAndItems = Order & {
  user: User;
  orderItems: (OrderItem & {
    product: Product;
  })[];
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}
