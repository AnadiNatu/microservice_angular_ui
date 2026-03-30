import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
      <h1 class="h2">Admin Dashboard</h1>
      <div class="btn-toolbar mb-2 mb-md-0">
        <button type="button" class="btn btn-sm btn-outline-secondary me-2">
          <i class="bi bi-download"></i> Export Report
        </button>
        <button type="button" class="btn btn-sm btn-primary">
          <i class="bi bi-plus-lg"></i> New Product
        </button>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4">
      @for (stat of stats; track stat.label) {
        <div class="col">
          <app-card [title]="stat.label" [actionLabel]="'View ' + stat.label">
            <div card-body>
              <div class="d-flex align-items-center justify-content-between">
                <h3 class="mb-0 fw-bold">{{ stat.value }}</h3>
                <div [class]="'p-2 rounded-circle ' + stat.bgClass">
                  <i [class]="'bi ' + stat.icon + ' fs-4 text-white'"></i>
                </div>
              </div>
              <div class="mt-2 text-muted small">
                <span class="text-success fw-semibold"><i class="bi bi-arrow-up"></i> {{ stat.trend }}%</span> vs last month
              </div>
            </div>
          </app-card>
        </div>
      }
    </div>

    <div class="row g-4">
      <div class="col-lg-8">
        <div class="card p-4">
          <h5 class="fw-bold mb-4">Recent Orders</h5>
          <div class="table-responsive">
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of recentOrders; track order.id) {
                  <tr>
                    <td class="fw-semibold">#{{ order.id }}</td>
                    <td>{{ order.customer }}</td>
                    <td>{{ order.date | date:'shortDate' }}</td>
                    <td>{{ order.amount | customCurrency }}</td>
                    <td>
                      <span [class]="'badge ' + getStatusClass(order.status)">
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                    <td class="text-end">
                      <button class="btn btn-sm btn-light" (click)="viewOrder(order.id)"><i class="bi bi-eye"></i></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card p-4">
          <h5 class="fw-bold mb-4">Top Categories</h5>
          <ul class="list-group list-group-flush">
            @for (cat of categories; track cat.name) {
              <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                <span>{{ cat.name }}</span>
                <span class="badge bg-light-blue text-primary rounded-pill">{{ cat.count }}</span>
              </li>
            }
          </ul>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats = [
    { label: 'Total Revenue', value: '$124,500', icon: 'bi-currency-dollar', trend: '12', bgClass: 'bg-primary' },
    { label: 'Total Orders', value: '1,240', icon: 'bi-cart', trend: '8', bgClass: 'bg-green' },
    { label: 'New Customers', value: '450', icon: 'bi-people', trend: '15', bgClass: 'bg-warning' },
    { label: 'Active Products', value: '85', icon: 'bi-box', trend: '2', bgClass: 'bg-info' }
  ];

  recentOrders = [
    { id: '1024', customer: 'Alice Smith', date: new Date(), amount: 150.50, status: 'completed' },
    { id: '1025', customer: 'Bob Johnson', date: new Date(), amount: 89.99, status: 'pending' },
    { id: '1026', customer: 'Charlie Brown', date: new Date(), amount: 210.00, status: 'shipped' },
    { id: '1027', customer: 'Diana Prince', date: new Date(), amount: 45.00, status: 'cancelled' }
  ];

  categories = [
    { name: 'Electronics', count: 45 },
    { name: 'Clothing', count: 32 },
    { name: 'Home & Kitchen', count: 28 },
    { name: 'Books', count: 15 }
  ];

  ngOnInit() {}

  viewOrder(id: string) {
    alert(`Viewing details for Order #${id}`);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-success-subtle text-success';
      case 'pending': return 'bg-warning-subtle text-warning';
      case 'shipped': return 'bg-info-subtle text-info';
      case 'cancelled': return 'bg-danger-subtle text-danger';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }
}
