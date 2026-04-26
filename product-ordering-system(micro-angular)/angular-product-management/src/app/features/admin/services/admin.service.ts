import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, forkJoin } from "rxjs";
import { Product, Order } from "../../../core/models/product.model";
import { CreateProductRequest, CreateOrderRequest, DashboardStats, getOrderStatusBadgeClass } from "../../../core/modules/product.model";
import { OrderService } from "../../../core/services/order.service";
import { ProductService } from "../../../core/services/product.service";


@Injectable({ providedIn: 'root' })
export class AdminService {
 
  private readonly GW = 'http://localhost:8083';
 
  constructor(
    private http          : HttpClient,
    private productService: ProductService,
    private orderService  : OrderService
  ) {}
 
  // ── Products ──────────────────────────────────────────────
 
  /**
   * Returns a flat array of all products (up to 1000).
   * Uses /api/products?page=0&size=1000 (ADMIN).
   * Sorted by price asc/desc in the UI via helper.
   */
  getAllProducts(): Observable<Product[]> {
    return this.productService.getAllProducts(0, 1000).pipe(
      map(page => page.content)
    );
  }
 
  createProduct(dto: CreateProductRequest): Observable<Product> {
    return this.productService.createProduct(dto);
  }
 
  /**
   * Update: backend has no generic PUT /api/products/{id}.
   * We handle field-level updates via stock and deactivate endpoints.
   * For description / price updates the ADMIN creates a new product
   * and deactivates the old one, OR we call updateStock + any future endpoint.
   * For now: updates stock and returns the refreshed product.
   */
  updateProductStock(productId: number, quantity: number): Observable<Product> {
    return this.productService.updateStock(productId, quantity);
  }
 
  deactivateProduct(productId: number): Observable<Product> {
    return this.productService.deactivateProduct(productId);
  }
 
  uploadProductImage(productId: number, file: File): Observable<Product> {
    return this.productService.uploadProductImage(productId, file);
  }
 
  deleteProductImage(productId: number): Observable<Product> {
    return this.productService.deleteProductImage(productId);
  }
 
  getProductsByAscOrder(products: Product[]): Product[] {
    return [...products].sort((a, b) => a.price - b.price);
  }
 
  getProductsByDescOrder(products: Product[]): Product[] {
    return [...products].sort((a, b) => b.price - a.price);
  }
 
  getTopOrderedProducts(products: Product[]): Product[] {
    // No dedicated endpoint; return active products with highest stock as proxy
    return [...products]
      .filter(p => p.active !== false)
      .sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0))
      .slice(0, 5);
  }
 
  // ── Orders ────────────────────────────────────────────────
 
  /**
   * Returns the first page of orders by status PENDING (or all if needed).
   * For a full list the admin can page through via getOrdersByStatus().
   */
  getAllOrders(): Observable<Order[]> {
    // Load first 200 across all statuses using orderService
    return forkJoin([
      this.orderService.getOrdersByStatus('PENDING',    0, 50).pipe(map(p => p.content)),
      this.orderService.getOrdersByStatus('CONFIRMED',  0, 50).pipe(map(p => p.content)),
      this.orderService.getOrdersByStatus('PROCESSING', 0, 50).pipe(map(p => p.content)),
      this.orderService.getOrdersByStatus('SHIPPED',    0, 50).pipe(map(p => p.content)),
      this.orderService.getOrdersByStatus('DELIVERED',  0, 50).pipe(map(p => p.content)),
      this.orderService.getOrdersByStatus('CANCELLED',  0, 50).pipe(map(p => p.content)),
    ]).pipe(
      map(([a, b, c, d, e, f]) => [...a, ...b, ...c, ...d, ...e, ...f])
    );
  }
 
  createOrder(dto: CreateOrderRequest): Observable<Order> {
    return this.orderService.createOrder(dto);
  }
 
  updateOrderStatus(orderId: number, status: string): Observable<Order> {
    return this.orderService.updateOrderStatus(orderId, status);
  }
 
  cancelOrder(orderId: number): Observable<Order> {
    return this.orderService.cancelOrder(orderId);
  }
 
  // ── Users ─────────────────────────────────────────────────
 
  /**
   * GET /api/users?page=0&size=200  – demo-service1 users
   * These are the synced users in demo-service1.
   */
  getAllUsers(): Observable<any[]> {
    const params = new HttpParams().set('page', 0).set('size', 200);
    return this.http.get<any>(`${this.GW}/api/users`, { params }).pipe(
      map((res: any) => {
        // If Spring Page, unwrap content; if plain array, return as-is
        if (res?.content) return res.content;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }
 
  // ── Dashboard ─────────────────────────────────────────────
 
  /**
   * Assembles DashboardStats by calling:
   *   /api/products/active (to count products)
   *   /api/orders/stats    (order counts + revenue)
   * All in parallel via forkJoin.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      products: this.productService.getActiveProducts(0, 1),
      stats   : this.orderService.getOrderStatistics(),
    }).pipe(
      map(({ products, stats }) => ({
        totalProducts   : products.totalElements,
        totalOrders     : stats.totalOrders,
        totalUsers      : 0,                // filled separately if needed
        totalRevenue    : Number(stats.totalRevenue ?? 0),
        lowStockProducts: 0,                // filled separately if needed
        pendingOrders   : stats.byStatus?.['PENDING'] ?? 0,
      }))
    );
  }
 
  // ── Order logs (simulated via order filtering) ─────────────
 
  // No oreder descriptions
  // getOrderLogsByProduct(productName: string): Observable<Order[]> {
  //   return this.getAllOrders().pipe(
  //     map(orders =>
  //       orders.filter(o =>
  //         o.?.some(p =>
  //           p.productName?.toLowerCase().includes(productName.toLowerCase())
  //         ) ?? false
  //       )
  //     )
  //   );
  // }
 
  getOrderLogsByUser(userId: number): Observable<Order[]> {
    return this.orderService.getOrdersByUser(userId, 0, 200).pipe(
      map(page => page.content)
    );
  }
 
  // ── Helpers re-exported ───────────────────────────────────
 
  getStatusBadgeClass = getOrderStatusBadgeClass;
}