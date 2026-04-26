export interface Product {
  productId: number;
  productName: string;
  productDesc: string;
  productInventory: number;
  active : boolean;
  stockQuantity : number;
  price: number;
  category?: string;
  image?: string;
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

export enum OrderStatus{
     ORDERED = 'ORDERED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED'
}

export interface Order {
  orderId: number;
  orderDate: Date;
  orderQuantity: number;
  estimateDeliveryDate: Date;
  deliveryDate: Date;
  orderStatus: OrderStatus;
  userName: string;
  userId: number;
  productName: string;
  productId: number;
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