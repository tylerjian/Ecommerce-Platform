import type { OrderWithUserAndItems } from "@/types";

interface OrderConfirmationEmailProps {
  order: OrderWithUserAndItems;
}

export function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  const orderId = order.id.slice(-8).toUpperCase();

  return (
    <div
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#f9fafb",
        padding: "24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#2563eb",
          borderRadius: "12px",
          padding: "32px 24px",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        <h1 style={{ color: "#ffffff", margin: "0 0 8px", fontSize: "24px", fontWeight: "800" }}>
          ShopNext
        </h1>
        <p style={{ color: "#bfdbfe", margin: "0", fontSize: "16px" }}>
          Order Confirmed!
        </p>
      </div>

      {/* Body */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          padding: "32px 24px",
          marginBottom: "16px",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ color: "#374151", fontSize: "16px", margin: "0 0 16px" }}>
          Hi {order.user.name ?? "there"},
        </p>
        <p style={{ color: "#374151", fontSize: "16px", margin: "0 0 24px" }}>
          Thanks for your purchase! Your order{" "}
          <strong style={{ color: "#111827" }}>#{orderId}</strong> has been confirmed
          and is being processed.
        </p>

        {/* Order ID badge */}
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "24px",
          }}
        >
          <p style={{ margin: "0", fontSize: "13px", color: "#6b7280" }}>Order ID</p>
          <p style={{ margin: "4px 0 0", fontSize: "18px", fontWeight: "700", color: "#1d4ed8" }}>
            #{orderId}
          </p>
        </div>

        {/* Items table */}
        <h2
          style={{
            fontSize: "14px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#6b7280",
            margin: "0 0 12px",
          }}
        >
          Items Ordered
        </h2>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px 0",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Product
              </th>
              <th
                style={{
                  textAlign: "center",
                  padding: "8px 0",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "8px 0",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Price
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "8px 0",
                  fontSize: "13px",
                  color: "#374151",
                  fontWeight: "600",
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {order.orderItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 0", fontSize: "14px", color: "#111827" }}>
                  {item.product.name}
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    fontSize: "14px",
                    color: "#374151",
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    fontSize: "14px",
                    color: "#374151",
                    textAlign: "right",
                  }}
                >
                  ${Number(item.price).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "10px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                    textAlign: "right",
                  }}
                >
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={3}
                style={{
                  paddingTop: "16px",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#111827",
                  textAlign: "right",
                }}
              >
                Order Total
              </td>
              <td
                style={{
                  paddingTop: "16px",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "#2563eb",
                  textAlign: "right",
                }}
              >
                ${Number(order.total).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "0 24px" }}>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: "0 0 4px" }}>
          Questions? Reply to this email and we'll help you out.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "12px", margin: "0" }}>
          © {new Date().getFullYear()} ShopNext. All rights reserved.
        </p>
      </div>
    </div>
  );
}
