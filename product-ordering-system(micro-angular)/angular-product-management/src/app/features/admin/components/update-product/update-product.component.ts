import { Component, NgModule, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Product, UpdateProductDTO } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";
import { ProductService } from "../../../../core/services/product.service";

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
  standalone : true , 
  imports : [FormsModule , CommonModule , CustomCurrencyPipe , RouterModule , ReactiveFormsModule],
})
export class UpdateProductComponent implements OnInit {
  
  productForm !: FormGroup;
  productData !: Product;
  isLoading    = true;
  isSubmitting = false;
  errorMsg     = '';
  successMsg   = '';
 
  // Image
  selectedImageFile : File | null = null;
  imagePreview      : string | null = null;
  isUploadingImage  = false;
 
  constructor(
    private route         : ActivatedRoute,
    private fb            : FormBuilder,
    private productService: ProductService,
    private adminService  : AdminService,
    private router        : Router
  ) {}
 
  ngOnInit(): void {
    // Route param is now productId (number), not product name
    const idParam = this.route.snapshot.paramMap.get('id') ??
                    this.route.snapshot.paramMap.get('name'); // backward compat
    const productId = idParam ? Number(idParam) : NaN;
 
    if (isNaN(productId)) {
      alert('Invalid product ID');
      this.router.navigate(['/admin/products']);
      return;
    }
    this.loadProduct(productId);
  }
 
  private loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe({
      next: product => {
        this.productData = product;
        this.initForm(product);
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg  = 'Product not found.';
        this.isLoading = false;
        console.error('[UpdateProduct]', err);
      }
    });
  }
 
  private initForm(p: Product): void {
    this.productForm = this.fb.group({
      productId  : [{ value: p.productId,   disabled: true }],
      productName: [{ value: p.productName, disabled: true }], // name is immutable
      // Editable fields
      description  : [p.productDesc ?? '',   [Validators.required, Validators.minLength(10)]],
      price        : [p.price,                [Validators.required, Validators.min(0.01)]],
      // stockQuantity is updated via dedicated PUT /api/products/{id}/stock
      stockQuantity: [p.stockQuantity ?? 0,  [Validators.required, Validators.min(0)]],
    });
  }
 
  // ── Submit (stock update) ─────────────────────────────────
 
  /**
   * Backend does NOT have a generic PUT /api/products/{id} to update
   * description + price + stock in one call.
   * Available operations:
   *   PUT /api/products/{id}/stock?quantity=N
   *   PUT /api/products/{id}/deactivate
   *   POST /api/products/{id}/image
   *
   * We update stock via the dedicated endpoint.
   * Description / price changes require a new product creation in this backend.
   * A TODO note is displayed in the UI.
   */
  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.values(this.productForm.controls).forEach(c => c.markAsTouched());
      return;
    }
    this.isSubmitting = true;
    this.errorMsg     = '';
 
    const newStock = Number(this.productForm.get('stockQuantity')?.value);
 
    this.adminService.updateProductStock(this.productData.productId, newStock)
      .subscribe({
        next: updated => {
          this.productData      = updated;
          this.isSubmitting     = false;
          this.successMsg       = 'Stock updated successfully!';
        },
        error: err => {
          this.isSubmitting = false;
          this.errorMsg     = err?.error?.message ?? 'Stock update failed.';
        }
      });
  }
 
  // ── Image upload ──────────────────────────────────────────
 
  onImageSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = e => { this.imagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }
 
  uploadImage(): void {
    if (!this.selectedImageFile) return;
    this.isUploadingImage = true;
 
    this.adminService.uploadProductImage(this.productData.productId, this.selectedImageFile)
      .subscribe({
        next: updated => {
          this.productData       = updated;
          this.isUploadingImage  = false;
          this.selectedImageFile = null;
          this.imagePreview      = null;
          this.successMsg        = 'Image uploaded!';
        },
        error: err => {
          this.isUploadingImage = false;
          this.errorMsg = err?.error?.message ?? 'Image upload failed.';
        }
      });
  }
 
  removeImage(): void {
    if (!confirm('Remove product image?')) return;
    this.adminService.deleteProductImage(this.productData.productId).subscribe({
      next: updated => {
        this.productData = updated;
        this.successMsg  = 'Image removed.';
      },
      error: err => {
        this.errorMsg = err?.error?.message ?? 'Failed to remove image.';
      }
    });
  }
 
  // ── UI helpers ────────────────────────────────────────────
 
  hasError(field: string): boolean {
    const c = this.productForm?.get(field);
    return !!(c && c.invalid && c.touched);
  }
 
  getErrorMessage(field: string): string {
    const c = this.productForm?.get(field);
    if (c?.hasError('required'))  return 'This field is required';
    if (c?.hasError('minlength')) return `At least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('min'))       return `Must be ≥ ${c.errors?.['min'].min}`;
    return '';
  }
 
  cancel(): void { this.router.navigate(['/admin/products']); }
}