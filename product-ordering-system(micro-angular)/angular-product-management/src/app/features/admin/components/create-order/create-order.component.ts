import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { Product } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { CreateOrderRequest } from "../../../../core/modules/product.model";
import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, ReactiveFormsModule],
})
export class CreateOrderComponent implements OnInit {
  orderForm   : FormGroup;
  isSubmitting = false;
  products    : Product[] = [];
  selectedProduct: Product | null = null;

  statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  constructor(
    private fb          : FormBuilder,
    private adminService: AdminService,
    private authService : AuthService,
    private router      : Router
  ) {
    this.orderForm = this.fb.group({
      productId      : ['', Validators.required],
      quantity       : [1, [Validators.required, Validators.min(1)]],
      shippingAddress: ['', Validators.required],
      notes          : [''],
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next : products => { this.products = products; },
      error: err      => { console.error('Error loading products:', err); }
    });
  }

  onProductSelect(): void {
    const id = Number(this.orderForm.get('productId')?.value);
    this.selectedProduct = this.products.find(p => p.productId === id) || null;

    if (this.selectedProduct) {
      const stock = this.selectedProduct.stockQuantity ?? this.selectedProduct.productInventory ?? 0;
      const qtyCtrl = this.orderForm.get('quantity');
      qtyCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(stock)]);
      qtyCtrl?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(k =>
        this.orderForm.get(k)?.markAsTouched()
      );
      return;
    }

    this.isSubmitting = true;

    const currentUser = this.authService.getCurrentUser();
    const dto: CreateOrderRequest = {
      userId         : currentUser?.id ?? 0,
      productIds     : [Number(this.orderForm.value.productId)],
      quantities     : [Number(this.orderForm.value.quantity)],
      shippingAddress: this.orderForm.value.shippingAddress.trim(),
      notes          : this.orderForm.value.notes?.trim() || undefined,
    };

    this.adminService.createOrder(dto).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Order created successfully!');
        this.router.navigate(['/admin/orders']);
      },
      error: err => {
        console.error('Error creating order:', err);
        this.isSubmitting = false;
        alert('Failed to create order. Please try again.');
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.hasError('required')) return `${this.getFieldLabel(fieldName)} is required`;
    if (field?.hasError('min'))      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['min'].min}`;
    if (field?.hasError('max'))      return `Only ${field.errors?.['max'].max} units available in stock`;
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      productId      : 'Product',
      quantity       : 'Quantity',
      shippingAddress: 'Shipping address',
    };
    return labels[fieldName] || fieldName;
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/admin/orders']);
    }
  }
}