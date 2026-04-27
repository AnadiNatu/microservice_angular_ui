import { Component, OnInit } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { Product } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { getStockBadge } from "../../../../core/modules/product.model";

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, ReactiveFormsModule],
})
export class ProductListComponent implements OnInit {
  products        : Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm       = '';
  selectedCategory = 'all';
  isLoading        = true;
  errorMsg         = '';

  categories = ['all', 'Electronics', 'Accessories', 'Furniture', 'Clothing', 'Books', 'E2E'];

  constructor(
    private adminService: AdminService,
    private router      : Router
  ) {}

  ngOnInit(): void { this.loadProducts(); }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMsg  = '';

    this.adminService.getAllProducts().subscribe({
      next: products => {
        this.products         = products;
        this.filteredProducts = products;
        this.isLoading        = false;
      },
      error: err => {
        this.errorMsg  = 'Failed to load products.';
        this.isLoading = false;
        console.error('[ProductList]', err);
      }
    });
  }

  searchProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p => {
      // support both old (productDesc) and new (description) field names
      const desc = (p.description ?? p.productDesc ?? '').toLowerCase();
      const matchSearch =
        p.productName.toLowerCase().includes(term) || desc.includes(term);
      const matchCat =
        this.selectedCategory === 'all' || p.category === this.selectedCategory;
      return matchSearch && matchCat;
    });
  }

  filterByCategory(): void { this.searchProducts(); }

  clearFilters(): void {
    this.searchTerm       = '';
    this.selectedCategory = 'all';
    this.filteredProducts = this.products;
  }

  updateProduct(productId: number): void {
    this.router.navigate(['/admin/update-product', productId]);
  }

  deactivateProduct(product: Product): void {
    const msg = `Deactivate "${product.productName}"?\n\nThe product will be hidden from users.`;
    if (!confirm(msg)) return;

    this.adminService.deactivateProduct(product.productId).subscribe({
      next: () => {
        this.showToast('Product deactivated successfully');
        this.loadProducts();
      },
      error: err => {
        alert('Failed to deactivate product: ' + (err?.error?.message ?? err.message));
      }
    });
  }

  createNewProduct(): void {
    this.router.navigate(['/admin/create-product']);
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  getStockBadge = getStockBadge;

  private showToast(msg: string): void {
    const el = document.createElement('div');
    el.className =
      'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    el.style.zIndex = '9999';
    el.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}