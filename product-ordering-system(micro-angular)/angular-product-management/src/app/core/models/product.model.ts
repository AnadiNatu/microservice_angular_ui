export interface Product {
  productId: number;
  productName: string;
  productDesc?: string;       // kept for backward compat; backend uses description
  description?: string;       // backend field
  productInventory?: number;  // kept for backward compat; backend uses stockQuantity
  stockQuantity?: number;     // backend field
  active?: boolean;
  price: number;
  category?: string;
  image?: string;
  imageUrl?: string;          // backend field
  sku?: string;
  productOrderIds?: number[];
}

export interface CreateProductDTO {
  productName: string;
  productDesc: string;
  productInventory: number;
  price: number;
}

export interface UpdateProductDTO {
  productName: string;
  productDesc: string;
  productInventory: number;
  price: number;
}

export enum OrderStatus {
  ORDERED    = 'ORDERED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED  = 'DELIVERED',
  CANCELLED  = 'CANCELLED',
  PENDING    = 'PENDING',
  SHIPPED    = 'SHIPPED',
  COMPLETED  = 'COMPLETED'
}

export interface Order {
  orderId        : number;
  orderNumber   ?: string;
  orderDate     ?: any;
  orderQuantity ?: number;
  estimateDeliveryDate?: any;
  deliveryDate  ?: any;
  orderStatus    : any;
  userName      ?: string;   // old field
  username      ?: string;   // backend field
  userId         : number;
  productName   ?: string;
  productId     ?: number;
  productIds    ?: number[];
  quantities    ?: number[];
  totalAmount   ?: number;
  shippingAddress?: string;
  notes         ?: string;
  createdOn     ?: string;
  updatedOn     ?: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  productName: string;
  orderQuantity: number;
  estimateDeliveryDate: Date;
  deliveryDate: Date;
  orderStatus: string;
}

export interface OrderLogDTO {
  orderId: number;
  productName: string;
  userName: string;
  orderQuantity: number;
  orderPrice: number;
  orderStatus: OrderStatus;
  deliveredOn: Date;
  productInventory: number;
  productOrderQuantity: number;
}