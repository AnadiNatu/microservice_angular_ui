import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { getOrderStatusBadgeClass } from "../../../../core/modules/product.model";
import { OrderService } from "../../../../core/services/order.service";

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule],
})
export class OrderListComponent implements OnInit {
  orders        : Order[] = [];
  filteredOrders: Order[] = [];

  usernameFilter = '';
  statusFilter   = 'all';
  isLoading      = true;
  errorMsg       = '';

  statusOptions = [
    'all', 'PENDING', 'CONFIRMED', 'PROCESSING',
    'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'
  ];

  constructor(
    private adminService: AdminService,
    private orderService: OrderService,
    private router      : Router
  ) {}

  ngOnInit(): void { this.loadOrders(); }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    this.adminService.getAllOrders().subscribe({
      next: orders => {
        this.orders = orders.sort((a, b) =>
          new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime()
        );
        this.filteredOrders = this.orders;
        this.isLoading      = false;
      },
      error: err => {
        this.errorMsg  = 'Failed to load orders.';
        this.isLoading = false;
        console.error('[OrderList]', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(o => {
      const matchUser = !this.usernameFilter ||
        (o.username ?? o.userName ?? '').toLowerCase().includes(this.usernameFilter.toLowerCase());
      const matchStatus = this.statusFilter === 'all' || o.orderStatus === this.statusFilter;
      return matchUser && matchStatus;
    });
  }

  clearFilters(): void {
    this.usernameFilter = '';
    this.statusFilter   = 'all';
    this.filteredOrders = this.orders;
  }

  updateOrder(orderId: number): void {
    this.router.navigate(['/admin/update-order', orderId]);
  }

  cancelOrder(order: Order): void {
    if (!confirm(`Cancel order #${order.orderId}?\nThis cannot be undone.`)) return;
    this.orderService.cancelOrder(order.orderId).subscribe({
      next: () => { this.showToast('Order cancelled'); this.loadOrders(); },
      error: err => alert('Failed: ' + (err?.error?.message ?? err?.message))
    });
  }

  createNewOrder(): void { this.router.navigate(['/admin/create-order']); }
  goBack()        : void { this.router.navigate(['/admin/dashboard']); }

  getStatusBadgeClass = getOrderStatusBadgeClass;

  getProductSummary(order: Order): string {
    return `${order.productIds?.length ?? 0} product(s)`;
  }

  getTotalQty(order: Order): number {
    return (order.quantities ?? []).reduce((s, q) => s + q, 0);
  }

  private showToast(msg: string): void {
    const el = document.createElement('div');
    el.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    el.style.zIndex = '9999';
    el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}