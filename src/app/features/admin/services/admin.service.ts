import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, delay } from "rxjs";
import { Product, Order, CreateProductDTO, UpdateProductDTO, CreateOrderDTO, OrderLogDTO } from "../../../core/models/product.model";
import { User } from "../../../core/models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly BASE_URL = 'http://localhost:8080/api/admin/';

  // Mock data for demo
  private mockProducts: Product[] = [
    {
      productId: 1,
      productName: 'Laptop Pro 15',
      productDesc: 'High-performance laptop with 16GB RAM and 512GB SSD',
      productInventory: 45,
      price: 1299.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
    },
    {
      productId: 2,
      productName: 'Wireless Mouse',
      productDesc: 'Ergonomic wireless mouse with precision tracking',
      productInventory: 150,
      price: 29.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'
    },
    {
      productId: 3,
      productName: 'Mechanical Keyboard',
      productDesc: 'RGB mechanical keyboard with cherry MX switches',
      productInventory: 75,
      price: 89.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400'
    },
    {
      productId: 4,
      productName: '4K Monitor 27"',
      productDesc: 'Ultra HD 4K monitor with HDR support',
      productInventory: 30,
      price: 449.99,
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400'
    },
    {
      productId: 5,
      productName: 'USB-C Hub',
      productDesc: 'Multi-port USB-C hub with HDMI and SD card reader',
      productInventory: 200,
      price: 39.99,
      category: 'Accessories',
      image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400'
    }
  ];

  private mockOrders: Order[] = [
    {
      orderId: 1,
      orderDate: new Date('2024-03-15'),
      orderQuantity: 2,
      estimateDeliveryDate: new Date('2024-03-20'),
      deliveryDate: new Date('2024-03-19'),
      orderStatus: 'DELIVERED' as any,
      userName: 'John Doe',
      userId: 2,
      productName: 'Laptop Pro 15',
      productId: 1
    },
    {
      orderId: 2,
      orderDate: new Date('2024-03-18'),
      orderQuantity: 5,
      estimateDeliveryDate: new Date('2024-03-22'),
      deliveryDate: new Date('2024-03-22'),
      orderStatus: 'DISPATCHED' as any,
      userName: 'Jane Smith',
      userId: 3,
      productName: 'Wireless Mouse',
      productId: 2
    },
    {
      orderId: 3,
      orderDate: new Date('2024-03-20'),
      orderQuantity: 1,
      estimateDeliveryDate: new Date('2024-03-25'),
      deliveryDate: new Date('2024-03-25'),
      orderStatus: 'ORDERED' as any,
      userName: 'Bob Johnson',
      userId: 4,
      productName: '4K Monitor 27"',
      productId: 4
    }
  ];

  private mockUsers: User[] = [
    {
      id: 2,
      fname: 'John',
      lname: 'Doe',
      email: 'user@system.com',
      role: 'USER' as any,
      phoneNumber: '+1 (555) 987-6543'
    },
    {
      id: 3,
      fname: 'Jane',
      lname: 'Smith',
      email: 'jane.smith@example.com',
      role: 'USER' as any,
      phoneNumber: '+1 (555) 123-7890'
    },
    {
      id: 4,
      fname: 'Bob',
      lname: 'Johnson',
      email: 'bob.j@example.com',
      role: 'USER' as any,
      phoneNumber: '+1 (555) 456-7891'
    }
  ];

  constructor(private http: HttpClient) {}

  // ==================== PRODUCT OPERATIONS ====================

  /**
   * Get all products
   */
  getAllProducts(): Observable<Product[]> {
    // Mock implementation
    return of([...this.mockProducts]).pipe(delay(500));
    
    // Real implementation:
    // return this.http.get<Product[]>(`${this.BASE_URL}product/all`);
  }

  /**
   * Create new product
   */
  createProduct(product: CreateProductDTO): Observable<Product> {
    // Mock implementation
    const newProduct: Product = {
      productId: this.mockProducts.length + 1,
      ...product,
      productOrderIds: []
    };
    this.mockProducts.push(newProduct);
    return of(newProduct).pipe(delay(500));
    
    // Real implementation:
    // return this.http.post<Product>(`${this.BASE_URL}product`, product);
  }

  /**
   * Update product
   */
  updateProduct(product: UpdateProductDTO): Observable<Product> {
    // Mock implementation
    const index = this.mockProducts.findIndex(p => p.productName === product.productName);
    if (index !== -1) {
      this.mockProducts[index] = { ...this.mockProducts[index], ...product };
      return of(this.mockProducts[index]).pipe(delay(500));
    }
    throw new Error('Product not found');
    
    // Real implementation:
    // return this.http.put<Product>(`${this.BASE_URL}updateProduct`, product);
  }

  /**
   * Delete product
   */
  deleteProduct(productName: string): Observable<void> {
    // Mock implementation
    const index = this.mockProducts.findIndex(p => p.productName === productName);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
    }
    return of(void 0).pipe(delay(500));
    
    // Real implementation:
    // return this.http.delete<void>(`${this.BASE_URL}delete/product/${productName}`);
  }

  /**
   * Get products sorted by price (ascending)
   */
  getProductsByAscOrder(): Observable<Product[]> {
    const sorted = [...this.mockProducts].sort((a, b) => a.price - b.price);
    return of(sorted).pipe(delay(500));
  }

  /**
   * Get products sorted by price (descending)
   */
  getProductsByDescOrder(): Observable<Product[]> {
    const sorted = [...this.mockProducts].sort((a, b) => b.price - a.price);
    return of(sorted).pipe(delay(500));
  }

  /**
   * Get top ordered products
   */
  getTopOrderedProducts(): Observable<Product[]> {
    // Mock: return products with most orders
    return of([...this.mockProducts].slice(0, 3)).pipe(delay(500));
  }

  // ==================== ORDER OPERATIONS ====================

  /**
   * Get all orders
   */
  getAllOrders(): Observable<Order[]> {
    return of([...this.mockOrders]).pipe(delay(500));
    
    // Real implementation:
    // return this.http.get<Order[]>(`${this.BASE_URL}order/all`);
  }

  /**
   * Create new order
   */
  createOrder(order: CreateOrderDTO): Observable<Order> {
    // Mock implementation
    const newOrder: Order = {
      orderId: this.mockOrders.length + 1,
      orderDate: new Date(),
      orderQuantity: order.orderQuantity,
      estimateDeliveryDate: order.estimateDeliveryDate,
      deliveryDate: order.deliveryDate,
      orderStatus: order.orderStatus as any,
      userName: 'Current User',
      userId: 1,
      productName: order.productName,
      productId: 1
    };
    this.mockOrders.push(newOrder);
    return of(newOrder).pipe(delay(500));
    
    // Real implementation:
    // return this.http.post<Order>(`${this.BASE_URL}order`, order);
  }

  /**
   * Update order
   */
  updateOrder(order: Order): Observable<Order> {
    // Mock implementation
    const index = this.mockOrders.findIndex(o => o.orderId === order.orderId);
    if (index !== -1) {
      this.mockOrders[index] = order;
      return of(order).pipe(delay(500));
    }
    throw new Error('Order not found');
    
    // Real implementation:
    // return this.http.put<Order>(`${this.BASE_URL}updateOrder`, order);
  }

  /**
   * Delete order
   */
  deleteOrder(userId: number, productName: string): Observable<void> {
    // Mock implementation
    const index = this.mockOrders.findIndex(
      o => o.userId === userId && o.productName === productName
    );
    if (index !== -1) {
      this.mockOrders.splice(index, 1);
    }
    return of(void 0).pipe(delay(500));
    
    // Real implementation:
    // const params = new HttpParams().set('userId', userId).set('productName', productName);
    // return this.http.delete<void>(`${this.BASE_URL}delete/order`, { params });
  }

  /**
   * Get orders by product name
   */
  getOrdersByProductName(productName: string): Observable<Order[]> {
    const filtered = this.mockOrders.filter(o => o.productName.toLowerCase().includes(productName.toLowerCase()));
    return of(filtered).pipe(delay(500));
  }

  /**
   * Get orders by user ID
   */
  getOrdersByUserId(userId: number): Observable<Order[]> {
    const filtered = this.mockOrders.filter(o => o.userId === userId);
    return of(filtered).pipe(delay(500));
  }

  // ==================== USER OPERATIONS ====================

  /**
   * Get all users
   */
  getAllUsers(): Observable<User[]> {
    return of([...this.mockUsers]).pipe(delay(500));
    
    // Real implementation:
    // return this.http.get<User[]>(`${this.BASE_URL}users`);
  }

  // ==================== ORDER LOGS ====================

  /**
   * Get order logs by product
   */
  getOrderLogsByProduct(productName: string): Observable<OrderLogDTO[]> {
    // Mock implementation
    const logs: OrderLogDTO[] = this.mockOrders
      .filter(o => o.productName.toLowerCase().includes(productName.toLowerCase()))
      .map(o => ({
        orderId: o.orderId,
        productName: o.productName,
        userName: o.userName,
        orderQuantity: o.orderQuantity,
        orderPrice: 0,
        orderStatus: o.orderStatus,
        deliveredOn: o.deliveryDate,
        productInventory: 0,
        productOrderQuantity: o.orderQuantity
      }));
    
    return of(logs).pipe(delay(500));
    
    // Real implementation:
    // const params = new HttpParams().set('productName', productName);
    // return this.http.get<OrderLogDTO[]>(`${this.BASE_URL}logs/product`, { params });
  }

  /**
   * Get order logs by users
   */
  getOrderLogsByUsers(): Observable<OrderLogDTO[]> {
    // Mock implementation
    const logs: OrderLogDTO[] = this.mockOrders.map(o => ({
      orderId: o.orderId,
      productName: o.productName,
      userName: o.userName,
      orderQuantity: o.orderQuantity,
      orderPrice: 0,
      orderStatus: o.orderStatus,
      deliveredOn: o.deliveryDate,
      productInventory: 0,
      productOrderQuantity: o.orderQuantity
    }));
    
    return of(logs).pipe(delay(500));
    
    // Real implementation:
    // return this.http.get<OrderLogDTO[]>(`${this.BASE_URL}logs/user`);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get dashboard stats
   */
  getDashboardStats(): Observable<any> {
    return of({
      totalProducts: this.mockProducts.length,
      totalOrders: this.mockOrders.length,
      totalUsers: this.mockUsers.length,
      totalRevenue: this.mockOrders.reduce((sum, o) => sum + (o.orderQuantity * 100), 0),
      lowStockProducts: this.mockProducts.filter(p => p.productInventory < 50).length,
      pendingOrders: this.mockOrders.filter(o => o.orderStatus === 'ORDERED').length
    }).pipe(delay(500));
  }

  /**
   * Get revenue data for chart
   */
  getRevenueData(): Observable<any[]> {
    return of([
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 16000 },
      { month: 'May', revenue: 21000 },
      { month: 'Jun', revenue: 25000 }
    ]).pipe(delay(500));
  }
}