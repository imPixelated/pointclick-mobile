export type Product = {
  id: number; name: string; description: string; category: string; brand: string;
  price: number; availableQuantity: number; imageUrl: string | null;
  outOfStock: boolean; lowStock?: boolean; active?: boolean; averageRating: number; reviewCount: number;
};
export type OrderItem = { id: number; productId: number; productName: string; productImageUrl: string | null; quantity: number; unitPriceAtMoment: number; subtotal: number };
export type Order = { id: number; status: string; orderDate?: string; itemsAmount: number; discountAmount: number; freightAmount: number; totalAmount: number; couponCode?: string | null; deliveryAddress?: string | null; items: OrderItem[] };
export type Address = { cep: string; street: string; number: string; complement?: string | null; city: string; state: string };
export type Me = { id: number; fullName: string; email: string; cpf?: string | null; phone?: string | null; address: Address | null };
export type Quote = { cep: string; shippingPrice: number; estimatedDays: number; street?: string; district?: string; city?: string; state?: string };
export type Payment = { id: number; orderId: number; method: string; status: string; amount: number; installments?: number; cardLastFourDigits?: string; pixCode?: string; pixConfirmationUrl?: string; bankSlipBarCode?: string; bankSlipConfirmationUrl?: string; digitableLine?: string };
export type OrderSummary = { id: number; orderDate: string; totalAmount: number; status: string };
export const STATUS: Record<string, string> = {
  PENDING: "Carrinho aberto", CLOSED: "Aguardando pagamento", PAID: "Pagamento aprovado",
  SHIPPED: "A caminho", DELIVERED: "Entregue", FINISHED: "Finalizado", CANCELLED: "Cancelado",
};

export type Favorite = { id: number; product: Product; createdAt: string };
export type Review = { id: number; orderId: number; productId: number; userFullName: string; rating: number; comment?: string | null; createdAt: string };
export type Notif = { id: number; type: string; title: string; message: string; linkUrl?: string | null; read: boolean; createdAt: string };
export const STATUS_COLOR: Record<string, string> = {
  PENDING: "#71675a", CLOSED: "#a16207", PAID: "#0f766e", SHIPPED: "#8f6f2e",
  DELIVERED: "#0f766e", FINISHED: "#0f766e", CANCELLED: "#b42318",
};
export const NOTIF_ICON: Record<string, string> = {
  PAYMENT_APPROVED: "card-outline", ORDER_SHIPPED: "cube-outline", ORDER_DELIVERED: "home-outline",
  ORDER_FINISHED: "checkmark-done-outline", ORDER_CANCELLED: "close-circle-outline",
  FAVORITE_PRODUCT_PROMOTION: "pricetag-outline", FAVORITE_PRODUCT_BACK_IN_STOCK: "heart-outline",
};
