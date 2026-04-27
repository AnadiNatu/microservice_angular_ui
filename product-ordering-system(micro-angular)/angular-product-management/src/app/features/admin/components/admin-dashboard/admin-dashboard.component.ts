import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Product, Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";
import { forkJoin } from "rxjs";
import { DashboardStats, getOrderStatusBadgeClass, getStockBadge } from "../../../../core/modules/product.model";


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, HighlightDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  stats: DashboardStats = {
    totalProducts   : 0,
    totalOrders     : 0,
    totalUsers      : 0,
    totalRevenue    : 0,
    lowStockProducts: 0,
    pendingOrders   : 0,
  };

  products    : Product[] = [];
  recentOrders: Order[]   = [];
  isLoading    = true;
  errorMsg     = '';

  constructor(
    private adminService: AdminService,
    private router      : Router
  ) {}

  ngOnInit(): void { this.loadDashboardData(); }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    forkJoin({
      stats   : this.adminService.getDashboardStats(),
      products: this.adminService.getAllProducts(),
      orders  : this.adminService.getAllOrders(),
    }).subscribe({
      next: ({ stats, products, orders }) => {
        this.stats = {
          ...stats,
          totalUsers      : 0,
          lowStockProducts: products.filter(p => (p.stockQuantity ?? 0) < 20).length,
        };
        this.products     = products;
        this.recentOrders = orders
          .sort((a, b) =>
            new Date(b.orderDate ?? 0).getTime() - new Date(a.orderDate ?? 0).getTime()
          )
          .slice(0, 5);
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg  = 'Failed to load dashboard data. Check the API gateway.';
        this.isLoading = false;
        console.error('[Dashboard] load error', err);
      }
    });
  }

  filterByAsc(): void {
    this.products = this.adminService.getProductsByAscOrder(this.products);
  }

  filterByDesc(): void {
    this.products = this.adminService.getProductsByDescOrder(this.products);
  }

  filterTopOrdered(): void {
    this.products = this.adminService.getTopOrderedProducts(this.products);
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/admin/update-product', productId]);
  }

  viewOrder(orderId: number): void {
    this.router.navigate(['/admin/update-order', orderId]);
  }

  getStatusClass = getOrderStatusBadgeClass;
  getStockLevel  = getStockBadge;

  getOrderProductSummary(order: Order): string {
    return `${order.productIds?.length ?? 0} product(s)`;
  }

  getOrderCustomer(order: Order): string {
    return order.username ?? order.userName ?? `User #${order.userId}`;
  }
}