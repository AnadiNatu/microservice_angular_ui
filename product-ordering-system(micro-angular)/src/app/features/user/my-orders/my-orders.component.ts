import { Component, OnInit } from '@angular/core';
import { Order } from '../../../core/models/product.model';

@Component({
  selector: 'app-my-orders',
  template: `
    <h2 class="fw-bold mb-4">My Orders</h2>

    @if (orders.length === 0) {
      <div class="text-center py-5">
        <i class="bi bi-bag-x fs-1 text-muted"></i>
        <p class="mt-3">You haven't placed any orders yet.</p>
        <button class="btn btn-primary" routerLink="/user/products">Start Shopping</button>
      </div>
    } @else {
      <div class="row g-4">
        @for (order of orders; track order.id) {
          <div class="col-12">
            <div class="card p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 class="fw-bold mb-1">Order #{{ order.id }}</h5>
                  <div class="text-muted smaller">Placed on {{ order.createdAt | date:'medium' }}</div>
                </div>
                <span [class]="'badge ' + getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </div>
              
              <div class="table-responsive mb-3">
                <table class="table table-sm table-borderless align-middle mb-0">
                  <thead>
                    <tr class="text-muted smaller border-bottom">
                      <th>Product</th>
                      <th class="text-center">Qty</th>
                      <th class="text-end">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of order.items; track item.productId) {
                      <tr>
                        <td>{{ item.productName }}</td>
                        <td class="text-center">{{ item.quantity }}</td>
                        <td class="text-end">{{ item.price | customCurrency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                <div class="text-muted small">Total Amount</div>
                <h5 class="fw-bold text-green mb-0">{{ order.total | customCurrency }}</h5>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .smaller { font-size: 0.75rem; }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [
    {
      id: 'ORD-5521',
      userId: '2',
      total: 124.99,
      status: 'SHIPPED',
      createdAt: new Date(Date.now() - 86400000),
      items: [
        { productId: 'PRD-001', productName: 'Wireless Headphones', quantity: 1, price: 99.99 },
        { productId: 'PRD-003', productName: 'Cotton T-Shirt', quantity: 1, price: 25.00 }
      ]
    },
    {
      id: 'ORD-5522',
      userId: '2',
      total: 199.50,
      status: 'PENDING',
      createdAt: new Date(),
      items: [
        { productId: 'PRD-002', productName: 'Smart Watch', quantity: 1, price: 199.50 }
      ]
    }
  ];

  ngOnInit() {}

  getStatusClass(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'bg-success';
      case 'PENDING': return 'bg-warning';
      case 'SHIPPED': return 'bg-info';
      case 'CANCELLED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
