import { Component, OnInit, signal } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { ProductRequest, ProductResponse } from '../../../core/models/product.model';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products = signal<ProductResponse[]>([]);
  loading = signal<boolean>(false);
  showModal = signal<boolean>(false);
  showDetailsModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  selectedProductId = signal<number | null>(null);
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  selectedProduct = signal<ProductResponse | null>(null);
  
  productForm = signal<ProductRequest>({
    sku: '',
    name: '',
    category: '',
    originalPrice: 0,
    profite: 0,
    active: true
  });

  errorMessage = signal<string>('');
  validationErrors = signal<{[key: string]: string}>({});
  
  notification = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.products.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.selectedProductId.set(null);
    this.productForm.set({
      sku: '',
      name: '',
      category: '',
      originalPrice: 0,
      profite: 0,
      active: true
    });
    this.selectedFile.set(null);
    this.imagePreview.set(null);
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(product: ProductResponse): void {
    this.isEditMode.set(true);
    this.selectedProductId.set(product.id);
    
    this.productService.getProductById(product.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productForm.set({
            sku: response.data.sku,
            name: response.data.name,
            category: response.data.category || '',
            originalPrice: response.data.originalPrice,
            profite: response.data.profite,
            active: response.data.active
          });
          this.selectedFile.set(null);
          this.imagePreview.set(response.data.imageUrl || null);
          this.errorMessage.set('');
          this.validationErrors.set({});
          this.showModal.set(true);
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.showNotification('error', 'Failed to load product details');
      }
    });
  }

  openDetailsModal(product: ProductResponse): void {
    this.selectedProduct.set(product);
    this.showDetailsModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  closeDetailsModal(): void {
    this.showDetailsModal.set(false);
    this.selectedProduct.set(null);
  }

  handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(): void {
    this.errorMessage.set('');
    this.validationErrors.set({});
    this.loading.set(true);

    const request: ProductRequest = {
      ...this.productForm()
    };

    if (this.isEditMode() && this.selectedProductId()) {
      // Update product first
      this.productService.updateProduct(this.selectedProductId()!, request).subscribe({
        next: (response) => {
          if (response.success) {
            // If image selected, upload it
            if (this.selectedFile() && response.data?.id) {
              this.productService.uploadProductImage(response.data.id, this.selectedFile()!).subscribe({
                next: () => {
                  this.showNotification('success', 'Product updated with image successfully!');
                  this.closeModal();
                  this.loadProducts();
                },
                error: (error) => {
                  console.error('Error uploading image:', error);
                  this.showNotification('success', 'Product updated but image upload failed');
                  this.closeModal();
                  this.loadProducts();
                }
              });
            } else {
              this.showNotification('success', 'Product updated successfully!');
              this.closeModal();
              this.loadProducts();
            }
          }
        },
        error: (error) => {
          console.error('Error updating product:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    } else {
      // Create product first
      this.productService.createProduct(request).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // If image selected, upload it (uses /api/products/{id}/image endpoint)
            if (this.selectedFile()) {
              this.productService.uploadProductImage(response.data.id, this.selectedFile()!).subscribe({
                next: (uploadResponse) => {
                  console.log('Image uploaded successfully:', uploadResponse);
                  this.showNotification('success', 'Product created with image successfully!');
                  this.closeModal();
                  this.loadProducts();
                },
                error: (error) => {
                  console.error('Error uploading image:', error);
                  this.showNotification('success', 'Product created but image upload failed');
                  this.closeModal();
                  this.loadProducts();
                }
              });
            } else {
              this.showNotification('success', 'Product created successfully!');
              this.closeModal();
              this.loadProducts();
            }
          }
        },
        error: (error) => {
          console.error('Error creating product:', error);
          this.loading.set(false);
          this.handleError(error);
        }
      });
    }
  }

  deleteProduct(id: number): void {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    this.loading.set(true);
    this.productService.deleteProduct(id).subscribe({
      next: (response) => {
        this.showNotification('success', 'Product deleted successfully!');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.loading.set(false);
        this.showNotification('error', error.error?.message || 'Failed to delete product');
      }
    });
  }

  updateFormField(field: keyof ProductRequest, value: any): void {
    this.productForm.update(form => ({
      ...form,
      [field]: value
    }));
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(price);
  }

  showNotification(type: 'success' | 'error', message: string): void {
    this.notification.set({ type, message });
    setTimeout(() => {
      this.notification.set(null);
    }, 3000);
  }

  handleError(error: any): void {
    console.log('Full error object:', error);
    console.log('Error.error.data:', error.error?.data);
    
    if (error.error?.data && typeof error.error.data === 'object') {
      const data = error.error.data;
      const errors: {[key: string]: string} = {};
      
      Object.keys(data).forEach((field) => {
        if (typeof data[field] === 'string') {
          errors[field] = data[field];
        }
      });
      
      if (Object.keys(errors).length > 0) {
        this.validationErrors.set(errors);
        this.errorMessage.set(error.error.message || 'Validation failed');
      } else {
        this.errorMessage.set(error.error?.message || 'An error occurred. Please try again.');
      }
    } else if (error.error?.message) {
      this.errorMessage.set(error.error.message);
    } else {
      this.errorMessage.set('An error occurred. Please try again.');
    }
  }
}
