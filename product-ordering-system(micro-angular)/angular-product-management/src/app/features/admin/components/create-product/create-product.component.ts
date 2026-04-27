import { Component } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { CreateProductRequest } from "../../../../core/modules/product.model";
import { AuthService } from "../../../../core/services/auth.service";
import { ProductService } from "../../../../core/services/product.service";

@Component({
  selector: 'app-create-product',
  templateUrl: './create-product.component.html',
  styleUrls: ['./create-product.component.css'],
  standalone : true , 
  imports : [FormsModule , CommonModule , CustomCurrencyPipe , RouterModule ,  ReactiveFormsModule],
})
export class CreateProductComponent {
  productForm : FormGroup;
  isSubmitting = false;
  errorMsg     = '';
 
  selectedImageFile: File | null = null;
  imagePreview     : string | null = null;
 
  categories = ['Electronics', 'Accessories', 'Furniture', 'Clothing', 'Books'];
 
  constructor(
    private fb            : FormBuilder,
    private adminService  : AdminService,
    private productService: ProductService,
    private authService   : AuthService,
    private router        : Router
  ) {
    this.productForm = this.fb.group({
      // All field names match backend CreateProductDto exactly
      productName  : ['', [Validators.required, Validators.minLength(3)]],
      description  : ['', [Validators.required, Validators.minLength(10)]],
      price        : [0,  [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0,  [Validators.required, Validators.min(0)]],
      category     : ['Electronics', Validators.required],
      sku          : [''],
    });
  }
 
  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
 
  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview      = null;
  }
 
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.values(this.productForm.controls).forEach(c => c.markAsTouched());
      return;
    }
 
    this.isSubmitting = true;
    this.errorMsg     = '';
 
    const v             = this.productForm.value;
    const currentUserId = this.authService.getCurrentUser()?.id;
 
    const dto: CreateProductRequest = {
      productName    : v.productName.trim(),
      description    : v.description.trim(),
      price          : Number(v.price),
      stockQuantity  : Number(v.stockQuantity),
      category       : v.category,
      sku            : v.sku?.trim() || undefined,
      createdByUserId: currentUserId ?? undefined,
    };
 
    this.adminService.createProduct(dto).subscribe({
      next: product => {
        if (this.selectedImageFile) {
          this.productService.uploadProductImage(product.productId, this.selectedImageFile)
            .subscribe({
              next : () => this.finishCreate(),
              error: () => this.finishCreate(),
            });
        } else {
          this.finishCreate();
        }
      },
      error: err => {
        this.isSubmitting = false;
        this.errorMsg = err?.error?.message ?? err?.message ?? 'Failed to create product.';
      }
    });
  }
 
  private finishCreate(): void {
    this.isSubmitting = false;
    this.showToast('Product created successfully!');
    this.router.navigate(['/admin/products']);
  }
 
  hasError(field: string): boolean {
    const c = this.productForm.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.productForm.get(field);
    if (c?.hasError('required'))  return `${this.label(field)} is required`;
    if (c?.hasError('minlength')) return `At least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('min'))       return `${this.label(field)} must be ≥ ${c.errors?.['min'].min}`;
    return '';
  }
 
  private label(f: string): string {
    const m: Record<string, string> = {
      productName  : 'Product name',
      description  : 'Description',
      price        : 'Price',
      stockQuantity: 'Stock quantity',
      category     : 'Category',
    };
    return m[f] ?? f;
  }
 
  cancel(): void {
    if (confirm('Cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/admin/products']);
    }
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