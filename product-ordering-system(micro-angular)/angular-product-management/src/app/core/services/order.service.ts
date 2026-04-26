import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Order } from "../models/product.model";
import { CreateOrderRequest, OrderStatistics, PageResponse } from "../modules/product.model";


@Injectable({ providedIn: 'root' })
export class OrderService {
 
  private readonly GW = 'http://localhost:8083/api/orders';
 
  constructor(private http: HttpClient) {}

//   User + Admin

createOrder(dto: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.GW, dto);
}

getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.GW}/${orderId}`);
}

getOrdersByUser(userId: number, page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Order>>(`${this.GW}/user/${userId}`, { params });
}

getOrdersByDateRange(userId: number,startDate: string,endDate  : string,page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate',   endDate)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Order>>(
      `${this.GW}/user/${userId}/date-range`, { params }
    );
}

 cancelOrder(orderId: number): Observable<Order> {
    return this.http.put<Order>(`${this.GW}/${orderId}/cancel`, null);
}

// admin

getOrdersByStatus(status: string, page = 0, size = 10): Observable<PageResponse<Order>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Order>>(`${this.GW}/status/${status}`, { params });
}

updateOrderStatus(orderId: number, status: string): Observable<Order> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Order>(`${this.GW}/${orderId}/status`, null, { params });
}

getOrderStatistics(): Observable<OrderStatistics> {
    return this.http.get<OrderStatistics>(`${this.GW}/stats`);
}

//  Public & Feign inter-service
getProductOrderCount(productId: number): Observable<number> {
    return this.http.get<number>(`${this.GW}/product/${productId}/count`);
}

userHasOrders(userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.GW}/user/${userId}/exists`);
}
}

