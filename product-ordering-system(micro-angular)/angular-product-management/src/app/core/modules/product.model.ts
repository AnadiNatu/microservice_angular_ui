export interface Product {
  productId       : number;
  productName     : string;
  description     : string;     // was productDesc in old Angular model
  price           : number;
  stockQuantity   : number;     // was productInventory in old Angular model
  category        ?: string;
  sku             ?: string;
  active          ?: boolean;
  imageUrl        ?: string;    // was image in old Angular model
  createdByUserId ?: number;
  createdByUsername?: string;
  createdOn       ?: string;
  updatedOn       ?: string;
}
 
// POST /api/products  (ADMIN)
export interface CreateProductRequest {
  productName    : string;
  description    : string;
  price          : number;
  stockQuantity  : number;
  category       ?: string;
  sku            ?: string;
  createdByUserId?: number;
}
 
// Paginated response wrapper – Spring Page<ProductDto>
export interface PageResponse<T> {
  content         : T[];
  totalElements   : number;
  totalPages      : number;
  size            : number;
  number          : number;   // current page index (0-based)
  first           : boolean;
  last            : boolean;
  empty           : boolean;
}
 
// ── Order (backend demo-service2 OrderDto) ───────────────────
 
// Backend OrderStatus enum
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';
 
// Mirrors backend OrderDto
export interface Order {
  orderId        : number;
  orderNumber    : string;
  userId         : number;
  username       : string;
  productIds     : number[];
  productDetails ?: ProductInfo[];
  quantities     : number[];
  totalAmount    : number;
  orderStatus    : OrderStatus;
  shippingAddress: string;
  notes          ?: string;
  orderDate      ?: string;
  deliveryDate   ?: string;
  createdOn      ?: string;
  updatedOn      ?: string;
}
 
// Embedded product info inside OrderDto
export interface ProductInfo {
  productId    : number;
  productName  : string;
  price        : number;
  stockQuantity: number;
  category     ?: string;
}
 
// POST /api/orders  (USER or ADMIN)
export interface CreateOrderRequest {
  userId         : number;
  productIds     : number[];
  quantities     : number[];
  shippingAddress: string;
  notes          ?: string;
}
 
// ── Dashboard stats (assembled on the Angular side) ──────────
 
export interface DashboardStats {
  totalProducts   : number;
  totalOrders     : number;
  totalUsers      : number;
  totalRevenue    : number;
  lowStockProducts: number;
  pendingOrders   : number;
}
 
// GET /api/orders/stats  →  backend response shape
export interface OrderStatistics {
  totalOrders : number;
  byStatus    : Record<string, number>;
  totalRevenue: number;
  generatedAt : string;
}
 
// ── UI helpers ───────────────────────────────────────────────
 
export function getOrderStatusBadgeClass(status: OrderStatus | string): string {
  const map: Record<string, string> = {
    DELIVERED : 'bg-success',
    CONFIRMED : 'bg-success',
    PROCESSING: 'bg-info',
    SHIPPED   : 'bg-info',
    PENDING   : 'bg-warning text-dark',
    CANCELLED : 'bg-danger',
    REFUNDED  : 'bg-secondary',
  };
  return map[status] ?? 'bg-secondary';
}
 
export function getStockBadge(stock: number): { label: string; class: string } {
  if (stock === 0)  return { label: 'Out of Stock', class: 'bg-danger' };
  if (stock < 20)   return { label: 'Critical',     class: 'bg-warning text-dark' };
  if (stock < 50)   return { label: 'Low Stock',    class: 'bg-info' };
  return                   { label: 'In Stock',     class: 'bg-success' };
}