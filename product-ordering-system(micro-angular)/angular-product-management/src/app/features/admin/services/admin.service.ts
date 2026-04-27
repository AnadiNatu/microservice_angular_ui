import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, map, forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Product, Order, OrderLogDTO } from "../../../core/models/product.model";
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

  getAllProducts(): Observable<Product[]> {
    return this.productService.getAllProducts(0, 1000).pipe(
      map(page => page.content)
    );
  }

  createProduct(dto: CreateProductRequest): Observable<Product> {
    return this.productService.createProduct(dto);
  }

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
    return [...products]
      .filter(p => p.active !== false)
      .sort((a, b) => (b.stockQuantity ?? 0) - (a.stockQuantity ?? 0))
      .slice(0, 5);
  }

  // ── Orders ────────────────────────────────────────────────

  getAllOrders(): Observable<Order[]> {
    return forkJoin([
      this.orderService.getOrdersByStatus('PENDING',    0, 50).pipe(map(p => p.content), catchError(() => of([]))),
      this.orderService.getOrdersByStatus('CONFIRMED',  0, 50).pipe(map(p => p.content), catchError(() => of([]))),
      this.orderService.getOrdersByStatus('PROCESSING', 0, 50).pipe(map(p => p.content), catchError(() => of([]))),
      this.orderService.getOrdersByStatus('SHIPPED',    0, 50).pipe(map(p => p.content), catchError(() => of([]))),
      this.orderService.getOrdersByStatus('DELIVERED',  0, 50).pipe(map(p => p.content), catchError(() => of([]))),
      this.orderService.getOrdersByStatus('CANCELLED',  0, 50).pipe(map(p => p.content), catchError(() => of([]))),
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

  /**
   * updateOrder — extracts status from the Order object and calls updateOrderStatus.
   * update-order.component calls this with a full Order; backend only supports
   * a status update via PUT /api/orders/{id}/status.
   */
  updateOrder(order: Order): Observable<Order> {
    return this.orderService.updateOrderStatus(order.orderId, order.orderStatus);
  }

  cancelOrder(orderId: number): Observable<Order> {
    return this.orderService.cancelOrder(orderId);
  }

  // ── Users ─────────────────────────────────────────────────

  getAllUsers(): Observable<any[]> {
    const params = new HttpParams().set('page', 0).set('size', 200);
    return this.http.get<any>(`${this.GW}/api/users`, { params }).pipe(
      map((res: any) => {
        if (res?.content) return res.content;
        if (Array.isArray(res)) return res;
        return [];
      })
    );
  }

  // ── Dashboard ─────────────────────────────────────────────

  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      products: this.productService.getActiveProducts(0, 1),
      stats   : this.orderService.getOrderStatistics(),
    }).pipe(
      map(({ products, stats }) => ({
        totalProducts   : products.totalElements,
        totalOrders     : stats.totalOrders,
        totalUsers      : 0,
        totalRevenue    : Number(stats.totalRevenue ?? 0),
        lowStockProducts: 0,
        pendingOrders   : stats.byStatus?.['PENDING'] ?? 0,
      }))
    );
  }

  // ── Order Logs ────────────────────────────────────────────

  /**
   * Fetch order logs filtered by product name.
   * Filters client-side from getAllOrders since there is no dedicated backend endpoint.
   */
  getOrderLogsByProduct(productName: string): Observable<OrderLogDTO[]> {
    return this.getAllOrders().pipe(
      map(orders =>
        orders
          .filter(o => {
            const name = (o.productName ?? '').toLowerCase();
            return name.includes(productName.toLowerCase());
          })
          .map(o => this.orderToLogDTO(o))
      )
    );
  }

  /**
   * Fetch all order logs grouped by users.
   * Returns all orders mapped to OrderLogDTO shape.
   */
  getOrderLogsByUsers(): Observable<OrderLogDTO[]> {
    return this.getAllOrders().pipe(
      map(orders => orders.map(o => this.orderToLogDTO(o)))
    );
  }

  getOrderLogsByUser(userId: number): Observable<Order[]> {
    return this.orderService.getOrdersByUser(userId, 0, 200).pipe(
      map(page => page.content)
    );
  }

  // ── Helpers re-exported ───────────────────────────────────

  getStatusBadgeClass = getOrderStatusBadgeClass;

  private orderToLogDTO(o: Order): OrderLogDTO {
    return {
      orderId             : o.orderId,
      productName         : o.productName ?? (o.productIds?.[0]?.toString() ?? ''),
      userName            : o.userName ?? o.username ?? `User #${o.userId}`,
      orderQuantity       : o.orderQuantity ?? (o.quantities?.[0] ?? 0),
      orderPrice          : o.totalAmount ?? 0,
      orderStatus         : o.orderStatus,
      deliveredOn         : o.deliveryDate ? new Date(o.deliveryDate) : (null as any),
      productInventory    : 0,
      productOrderQuantity: 0,
    };
  }
}