export type Product = {
  id: number; name: string; description: string; category: string; brand: string;
  price: number; availableQuantity: number; imageUrl: string | null;
  outOfStock: boolean; averageRating: number; reviewCount: number;
};
export type OrderItem = { id: number; productId: number; productName: string; productImageUrl: string | null; quantity: number; unitPriceAtMoment: number; subtotal: number };
export type Order = { id: number; status: string; orderDate?: string; itemsAmount: number; discountAmount: number; freightAmount: number; totalAmount: number; couponCode?: string | null; deliveryAddress?: string | null; items: OrderItem[] };
export type Address = { cep: string; street: string; number: string; complement?: string | null; city: string; state: string };
export type Me = { id: number; fullName: string; email: string; address: Address | null };
export type Quote = { cep: string; shippingPrice: number; estimatedDays: number; street?: string; district?: string; city?: string; state?: string };
export type Payment = { id: number; orderId: number; method: string; status: string; amount: number; installments?: number; cardLastFourDigits?: string; pixCode?: string; pixConfirmationUrl?: string; bankSlipBarCode?: string; bankSlipConfirmationUrl?: string; digitableLine?: string };
export type OrderSummary = { id: number; orderDate: string; totalAmount: number; status: string };
export const STATUS: Record<string, string> = {
  PENDING: "Carrinho aberto", CLOSED: "Aguardando pagamento", PAID: "Pagamento aprovado",
  SHIPPED: "A caminho", DELIVERED: "Entregue", FINISHED: "Finalizado", CANCELLED: "Cancelado",
};
