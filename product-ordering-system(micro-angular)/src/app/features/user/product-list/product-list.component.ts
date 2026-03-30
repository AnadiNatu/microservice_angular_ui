import { Component, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-user-product-list',
  template: `
    <div class="mb-4 d-flex justify-content-between align-items-center">
      <h2 class="fw-bold mb-0">Available Products</h2>
      <div class="badge bg-light-blue text-primary p-2">
        <i class="bi bi-cart3 me-2"></i> 0 items in cart
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4">
      @for (product of products; track product.id) {
        <div class="col">
          <app-card [title]="product.name" [isFeatured]="product.price > 100" [actionLabel]="'Add to Cart'">
            <div card-body>
              <img [src]="product.image" class="img-fluid rounded mb-3" style="height: 200px; width: 100%; object-fit: cover;">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-light text-dark">{{ product.category }}</span>
                <h5 class="text-green fw-bold mb-0">{{ product.price | customCurrency }}</h5>
              </div>
              <p class="text-muted small mb-0">High-quality {{ product.name }} designed for your needs.</p>
              <div class="mt-2 smaller text-muted">
                @if (product.stock > 0) {
                  <span class="text-success"><i class="bi bi-check-circle me-1"></i> In Stock ({{ product.stock }})</span>
                } @else {
                  <span class="text-danger"><i class="bi bi-x-circle me-1"></i> Out of Stock</span>
                }
              </div>
            </div>
          </app-card>
        </div>
      }
    </div>
  `
})
export class UserProductListComponent implements OnInit {
  products: Product[] = [
    { id: 'PRD-001', name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 45, image: 'https://picsum.photos/seed/head/400/300' },
    { id: 'PRD-002', name: 'Smart Watch', category: 'Electronics', price: 199.50, stock: 12, image: 'https://picsum.photos/seed/watch/400/300' },
    { id: 'PRD-003', name: 'Cotton T-Shirt', category: 'Clothing', price: 25.00, stock: 85, image: 'https://picsum.photos/seed/shirt/400/300' },
    { id: 'PRD-004', name: 'Mechanical Keyboard', category: 'Electronics', price: 120.00, stock: 5, image: 'https://picsum.photos/seed/kb/400/300' },
    { id: 'PRD-005', name: 'Denim Jeans', category: 'Clothing', price: 55.00, stock: 10, image: 'https://picsum.photos/seed/jeans/400/300' },
    { id: 'PRD-006', name: 'Coffee Mug', category: 'Home', price: 12.99, stock: 150, image: 'https://picsum.photos/seed/mug/400/300' }
  ];

  ngOnInit() {}
}
