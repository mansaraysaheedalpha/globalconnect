// src/types/payment.types.ts

/**
 * Money type - represents monetary values
 */
export interface Money {
  amount: number;      // Amount in smallest currency unit (cents)
  currency: string;    // ISO 4217 currency code
  formatted: string;   // Formatted display string (e.g., "$10.00")
}

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  EXPIRED = 'EXPIRED',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

/**
 * Refund status enum
 */
export enum RefundStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * Refund reason enum
 */
export enum RefundReason {
  REQUESTED_BY_CUSTOMER = 'REQUESTED_BY_CUSTOMER',
  DUPLICATE = 'DUPLICATE',
  FRAUDULENT = 'FRAUDULENT',
  EVENT_CANCELLED = 'EVENT_CANCELLED',
  OTHER = 'OTHER',
}

/**
 * Ticket type - represents a purchasable ticket tier
 */
export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: Money;
  quantityTotal?: number;      // null = unlimited
  quantityAvailable?: number;
  minPerOrder: number;
  maxPerOrder: number;
  salesStartAt?: string;
  salesEndAt?: string;
  isOnSale: boolean;
  sortOrder: number;
}

/**
 * Order item - represents a line item in an order
 */
export interface OrderItem {
  id: string;
  ticketType?: {
    id: string;
    name: string;
  };
  ticketTypeName: string;
  quantity: number;
  unitPrice: Money;
  totalPrice: Money;
}

/**
 * Promo code
 */
export interface PromoCode {
  id: string;
  code: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
}

/**
 * Payment record
 */
export interface Payment {
  id: string;
  status: PaymentStatus;
  amount: Money;
  amountRefunded?: Money;
  providerFee?: Money;
  netAmount?: Money;
  paymentMethodType?: string;
  paymentMethodBrand?: string;
  paymentMethodLast4?: string;
  processedAt?: string;
  createdAt: string;
}

/**
 * Refund record
 */
export interface Refund {
  id: string;
  status: RefundStatus;
  amount: Money;
  reason: RefundReason;
  reasonDetails?: string;
  processedAt?: string;
  createdAt: string;
}

/**
 * Event minimal type (for order context)
 */
export interface OrderEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  imageUrl?: string;
  venue?: {
    id: string;
    name: string;
  };
}

/**
 * Order - represents a purchase
 */
export interface Order {
  id: string;
  orderNumber: string;
  event: OrderEvent;
  status: OrderStatus;
  customerEmail: string;
  customerName: string;
  isGuestOrder: boolean;
  items: OrderItem[];
  subtotal: Money;
  discountAmount?: Money;
  taxAmount?: Money;
  totalAmount: Money;
  promoCode?: PromoCode;
  payment?: Payment;
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
}

/**
 * Payment intent - returned from createCheckoutSession
 */
export interface PaymentIntent {
  clientSecret: string;
  intentId: string;
  publishableKey: string;
  expiresAt?: string;
}

/**
 * Checkout session - order + payment intent
 */
export interface CheckoutSession {
  order: Order;
  paymentIntent: PaymentIntent;
}

/**
 * Cart item - used in checkout flow before order creation
 */
export interface CartItem {
  ticketTypeId: string;
  ticketType: TicketType;
  quantity: number;
}

/**
 * Checkout form data
 */
export interface CheckoutFormData {
  eventId: string;
  items: Array<{
    ticketTypeId: string;
    quantity: number;
  }>;
  promoCode?: string;
  // Guest checkout fields
  guestEmail?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guestPhone?: string;
}

/**
 * Refund form data
 */
export interface RefundFormData {
  orderId: string;
  amount?: number;  // In cents, optional for partial refund
  reason: RefundReason;
  reasonDetails?: string;
}

/**
 * Order connection for pagination
 */
export interface OrderConnection {
  edges: Array<{
    node: Order;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string;
  };
  totalCount: number;
}

/**
 * Payment error
 */
export interface PaymentError {
  code: string;
  message: string;
  retryable: boolean;
  suggestedAction?: string;
}
