import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="fw-bold mb-0">Product Management</h2>
      <button class="btn btn-primary" (click)="openAddModal()">
        <i class="bi bi-plus-lg me-2"></i> Add Product
      </button>
    </div>

    <div class="card p-0 overflow-hidden">
      <div class="p-3 bg-light border-bottom d-flex gap-2">
        <div class="input-group input-group-sm" style="max-width: 300px;">
          <span class="input-group-text bg-white border-end-0"><i class="bi bi-search"></i></span>
          <input type="text" class="form-control border-start-0" placeholder="Search products..." [(ngModel)]="searchTerm">
        </div>
        <select class="form-select form-select-sm" style="max-width: 150px;" [(ngModel)]="filterCategory">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
        </select>
      </div>
      
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th class="text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (product of filteredProducts; track product.id) {
              <tr>
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="product.image" class="rounded" width="40" height="40">
                    <div>
                      <div class="fw-semibold">{{ product.name }}</div>
                      <div class="text-muted smaller">ID: {{ product.id }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ product.category }}</td>
                <td>{{ product.price | customCurrency }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px; width: 60px;">
                      <div class="progress-bar" [class.bg-danger]="product.stock < 10" [style.width.%]="product.stock"></div>
                    </div>
                    <span class="smaller">{{ product.stock }}</span>
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + (product.stock > 0 ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger')">
                    {{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-light me-1" (click)="editProduct(product)"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-sm btn-light text-danger" (click)="deleteProduct(product.id)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal (Add/Edit) -->
    @if (showModal) {
      <div class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header border-0">
              <h5 class="modal-title fw-bold">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <div class="modal-body">
              <form #productForm="ngForm" (ngSubmit)="saveProduct(productForm)">
                <div class="text-center mb-4">
                  <div class="position-relative d-inline-block">
                    <img [src]="previewImage || 'https://picsum.photos/seed/placeholder/100/100'" 
                         class="rounded-circle border shadow-sm" width="100" height="100" style="object-fit: cover;">
                    <label class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-1" style="width: 32px; height: 32px;">
                      <i class="bi bi-camera"></i>
                      <input type="file" class="d-none" (change)="onFileSelected($event)" accept="image/*">
                    </label>
                  </div>
                  <div class="small text-muted mt-2">Click camera to upload photo</div>
                </div>

                <div class="mb-3">
                  <label class="form-label small fw-semibold">Product Name</label>
                  <input type="text" class="form-control" name="name" [(ngModel)]="currentProduct.name" required #name="ngModel">
                  @if (name.invalid && name.touched) {
                    <div class="text-danger smaller">Name is required</div>
                  }
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label small fw-semibold">Category</label>
                    <select class="form-select" name="category" [(ngModel)]="currentProduct.category" required>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Home">Home</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label small fw-semibold">Price</label>
                    <input type="number" class="form-control" name="price" [(ngModel)]="currentProduct.price" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-semibold">Stock Quantity</label>
                  <input type="number" class="form-control" name="stock" [(ngModel)]="currentProduct.stock" required>
                </div>
                <div class="modal-footer border-0 px-0 pb-0">
                  <button type="button" class="btn btn-light" (click)="closeModal()">Cancel</button>
                  <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid">
                    {{ isEditMode ? 'Update Product' : 'Save Product' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .smaller { font-size: 0.75rem; }
    .cursor-pointer { cursor: pointer; }
  `]
})
export class ProductListComponent implements OnInit {
  searchTerm = '';
  filterCategory = '';
  showModal = false;
  isEditMode = false;
  previewImage: string | null = null;
  
  currentProduct: any = {
    name: '',
    category: 'Electronics',
    price: 0,
    stock: 0
  };

  products = [
    { id: 'PRD-001', name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 45, image: 'https://picsum.photos/seed/head/100/100' },
    { id: 'PRD-002', name: 'Smart Watch', category: 'Electronics', price: 199.50, stock: 12, image: 'https://picsum.photos/seed/watch/100/100' },
    { id: 'PRD-003', name: 'Cotton T-Shirt', category: 'Clothing', price: 25.00, stock: 85, image: 'https://picsum.photos/seed/shirt/100/100' },
    { id: 'PRD-004', name: 'Mechanical Keyboard', category: 'Electronics', price: 120.00, stock: 5, image: 'https://picsum.photos/seed/kb/100/100' },
    { id: 'PRD-005', name: 'Denim Jeans', category: 'Clothing', price: 55.00, stock: 0, image: 'https://picsum.photos/seed/jeans/100/100' }
  ];

  get filteredProducts() {
    return this.products.filter(p => 
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
      (this.filterCategory === '' || p.category === this.filterCategory)
    );
  }

  ngOnInit() {}

  openAddModal() {
    this.isEditMode = false;
    this.currentProduct = { name: '', category: 'Electronics', price: 0, stock: 0 };
    this.previewImage = null;
    this.showModal = true;
  }

  editProduct(product: any) {
    this.isEditMode = true;
    this.currentProduct = { ...product };
    this.previewImage = product.image;
    this.showModal = true;
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
    }
  }

  closeModal() {
    this.showModal = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(form: any) {
    if (form.valid) {
      if (this.isEditMode) {
        const index = this.products.findIndex(p => p.id === this.currentProduct.id);
        if (index !== -1) {
          this.products[index] = { 
            ...this.currentProduct, 
            image: this.previewImage || this.currentProduct.image 
          };
        }
      } else {
        const newProduct = {
          ...this.currentProduct,
          id: `PRD-00${this.products.length + 1}`,
          image: this.previewImage || 'https://picsum.photos/seed/new/100/100'
        };
        this.products.unshift(newProduct);
      }
      this.closeModal();
    }
  }
}
