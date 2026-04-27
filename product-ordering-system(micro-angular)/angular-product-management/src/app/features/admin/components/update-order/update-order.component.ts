import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Order } from "../../../../core/models/product.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { CustomCurrencyPipe } from "../../../../shared/pipes/custom-currency.pipe";

@Component({
  selector: 'app-update-order',
  templateUrl: './update-order.component.html',
  styleUrls: ['./update-order.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, CustomCurrencyPipe, RouterModule, ReactiveFormsModule],
})
export class UpdateOrderComponent implements OnInit {
  orderForm!: FormGroup;
  orderData!: Order;
  orderId!: number;
  isLoading    = true;
  isSubmitting = false;

  statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

  constructor(
    private route       : ActivatedRoute,
    private fb          : FormBuilder,
    private adminService: AdminService,
    private router      : Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('orderId');
    this.orderId = idParam ? +idParam : 0;

    if (this.orderId) {
      this.loadOrder();
    } else {
      alert('Invalid order ID');
      this.router.navigate(['/admin/orders']);
    }
  }

  private loadOrder(): void {
    this.isLoading = true;

    this.adminService.getAllOrders().subscribe({
      next: (orders) => {
        const order = orders.find(o => o.orderId === this.orderId);

        if (order) {
          this.orderData = order;
          this.initializeForm(order);
          this.isLoading = false;
        } else {
          alert('Order not found');
          this.router.navigate(['/admin/orders']);
        }
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.isLoading = false;
        alert('Failed to load order');
        this.router.navigate(['/admin/orders']);
      }
    });
  }

  private initializeForm(order: Order): void {
    // Derive display-friendly values from the new Order shape
    const productLabel   = order.productName ?? (order.productIds?.join(', ') ?? '');
    const customerLabel  = order.username ?? order.userName ?? `User #${order.userId}`;
    const qty            = order.orderQuantity ?? (order.quantities?.[0] ?? 0);

    this.orderForm = this.fb.group({
      orderId     : [{ value: order.orderId,                                  disabled: true }],
      orderDate   : [{ value: this.formatDateForInput(order.orderDate),        disabled: true }],
      productName : [{ value: productLabel,                                    disabled: true }],
      userName    : [{ value: customerLabel,                                   disabled: true }],
      userId      : [{ value: order.userId,                                   disabled: true }],
      orderQuantity         : [qty, [Validators.required, Validators.min(1)]],
      estimateDeliveryDate  : [this.formatDateForInput(order.estimateDeliveryDate), Validators.required],
      deliveryDate          : [this.formatDateForInput(order.deliveryDate),         Validators.required],
      orderStatus           : [order.orderStatus, Validators.required],
    });
  }

  private formatDateForInput(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day   = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      Object.keys(this.orderForm.controls).forEach(key => {
        this.orderForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const updatedOrder: Order = {
      ...this.orderData,
      orderQuantity       : this.orderForm.get('orderQuantity')?.value,
      estimateDeliveryDate: new Date(this.orderForm.get('estimateDeliveryDate')?.value),
      deliveryDate        : new Date(this.orderForm.get('deliveryDate')?.value),
      orderStatus         : this.orderForm.get('orderStatus')?.value,
    };

    // Backend only supports status updates; call updateOrderStatus directly
    this.adminService.updateOrderStatus(updatedOrder.orderId, updatedOrder.orderStatus).subscribe({
      next: () => {
        console.log('Order updated successfully');
        this.isSubmitting = false;
        alert('Order updated successfully!');
        this.router.navigate(['/admin/orders']);
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.isSubmitting = false;
        alert('Failed to update order. Please try again.');
      }
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.orderForm?.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.orderForm?.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min'))      return 'Quantity must be at least 1';
    return '';
  }

  cancel(): void {
    this.router.navigate(['/admin/orders']);
  }
}