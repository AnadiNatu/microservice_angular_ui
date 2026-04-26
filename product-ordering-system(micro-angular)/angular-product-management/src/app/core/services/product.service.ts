import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Product } from "../models/product.model";
import { CreateProductRequest, PageResponse } from "../modules/product.model";



@Injectable({ providedIn: 'root' })
export class ProductService {
 
  private readonly GW = 'http://localhost:8083/api/products';
 
  constructor(private http: HttpClient) {} 

//   Admin

 getAllProducts(page   = 0,size   = 100,sortBy = 'createdOn'): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sortBy', sortBy);
    return this.http.get<PageResponse<Product>>(this.GW, { params });
  }

  createProduct(dto: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.GW, dto);
  }

  deactivateProduct(productId: number): Observable<Product> {
    return this.http.put<Product>(`${this.GW}/${productId}/deactivate`, null);
  }

  uploadProductImage(productId: number, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.GW}/${productId}/image`, formData);
  }

   deleteProductImage(productId: number): Observable<Product> {
    return this.http.delete<Product>(`${this.GW}/${productId}/image`);
  }

//   User + Admin
  getProduct(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.GW}/${productId}`);
  }

  getActiveProducts(page = 0, size = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Product>>(`${this.GW}/active`, { params });
  }

  getProductsByCategory(category: string, page = 0, size = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Product>>(
      `${this.GW}/category/${encodeURIComponent(category)}`, { params }
    );
  }

  searchProducts(keyword: string, page = 0, size = 20): Observable<PageResponse<Product>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<Product>>(`${this.GW}/search`, { params });
  }

  updateStock(productId: number, quantity: number): Observable<Product> {
    const params = new HttpParams().set('quantity', quantity);
    return this.http.put<Product>(`${this.GW}/${productId}/stock`, null, { params });
  }

  getProductsByIds(ids: number[]): Observable<Product[]> {
    return this.http.post<Product[]>(`${this.GW}/list`, ids);
  }

  isProductAvailable(productId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.GW}/${productId}/available`);
  }

  getProductOrderStats(productId: number): Observable<{ product: Product; totalOrders: number }> {
    return this.http.get<{ product: Product; totalOrders: number }>(
      `${this.GW}/${productId}/order-stats`
    );
  }
}
