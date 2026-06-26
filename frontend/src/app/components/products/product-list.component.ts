import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product, ProductRequest, Category, PageResponse } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Productos</h1>
        <p class="subtitle">Gestiona tu inventario</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">+ Nuevo Producto</button>
    </div>

    <!-- Filters -->
    <div class="filters-bar">
      <input class="search-input" type="text" placeholder="Buscar por nombre..."
             [(ngModel)]="searchTerm" (input)="onSearch()" />
      <select class="select-input" [(ngModel)]="selectedCategory" (change)="onSearch()">
        <option value="">Todas las categorías</option>
        <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
      </select>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div *ngIf="loading" class="loading">Cargando productos...</div>

      <table *ngIf="!loading" class="table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let product of products">
            <td class="sku">{{ product.sku || '—' }}</td>
            <td>
              <div class="product-name">{{ product.name }}</div>
              <div *ngIf="product.description" class="product-desc">{{ product.description }}</div>
            </td>
            <td><span class="badge-cat">{{ product.category }}</span></td>
            <td class="price">\${{ product.price | number:'1.2-2' }}</td>
            <td class="stock">{{ product.stock }}</td>
            <td>
              <span class="badge"
                [class.badge-ok]="product.stockStatus === 'OK'"
                [class.badge-low]="product.stockStatus === 'LOW'"
                [class.badge-out]="product.stockStatus === 'OUT'">
                {{ product.stockStatus === 'OK' ? 'OK' : product.stockStatus === 'LOW' ? 'Bajo' : 'Sin stock' }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn-icon edit" (click)="openModal(product)" title="Editar">✏️</button>
                <button class="btn-icon delete" (click)="confirmDelete(product)" title="Eliminar">🗑️</button>
              </div>
            </td>
          </tr>
          <tr *ngIf="products.length === 0">
            <td colspan="7" class="empty">No se encontraron productos</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div *ngIf="pageInfo" class="pagination">
        <span class="page-info">
          Mostrando {{ products.length }} de {{ pageInfo.totalElements }} productos
        </span>
        <div class="page-btns">
          <button [disabled]="currentPage === 0" (click)="changePage(currentPage - 1)">←</button>
          <span>Pág. {{ currentPage + 1 }} / {{ pageInfo.totalPages }}</span>
          <button [disabled]="pageInfo.last" (click)="changePage(currentPage + 1)">→</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Nombre *</label>
              <input formControlName="name" type="text" placeholder="Ej: Laptop Dell XPS" />
              <span class="error" *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched">
                El nombre es obligatorio
              </span>
            </div>
            <div class="form-group">
              <label>SKU</label>
              <input formControlName="sku" type="text" placeholder="Ej: LAP-001" />
            </div>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea formControlName="description" rows="2" placeholder="Descripción del producto..."></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoría *</label>
              <select formControlName="category">
                <option value="">Seleccionar...</option>
                <option *ngFor="let cat of categories" [value]="cat.name">{{ cat.name }}</option>
              </select>
              <span class="error" *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched">
                La categoría es obligatoria
              </span>
            </div>
            <div class="form-group">
              <label>Precio *</label>
              <input formControlName="price" type="number" step="0.01" min="0.01" placeholder="0.00" />
              <span class="error" *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                Precio válido requerido
              </span>
            </div>
          </div>
          <div class="form-group">
            <label>Stock *</label>
            <input formControlName="stock" type="number" min="0" placeholder="0" />
            <span class="error" *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched">
              Stock válido requerido
            </span>
          </div>
          <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary" [disabled]="saving">
              {{ saving ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div class="modal-overlay" *ngIf="showDeleteConfirm" (click)="showDeleteConfirm = false">
      <div class="modal modal-sm" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirmar eliminación</h2>
        </div>
        <p style="padding: 0 24px; color: #374151;">
          ¿Eliminar <strong>{{ deletingProduct?.name }}</strong>? Esta acción no se puede deshacer.
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showDeleteConfirm = false">Cancelar</button>
          <button class="btn btn-danger" (click)="deleteProduct()" [disabled]="saving">
            {{ saving ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .subtitle { color: #6b7280; margin: 4px 0 0; }
    .filters-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
    .search-input, .select-input {
      padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 0.9rem; background: white; outline: none;
    }
    .search-input { flex: 1; min-width: 200px; }
    .search-input:focus, .select-input:focus { border-color: #6366f1; }
    .table-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); overflow: hidden; }
    .loading { padding: 40px; text-align: center; color: #6b7280; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: #f9fafb; padding: 12px 16px; text-align: left; font-size: 0.78rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .table td { padding: 14px 16px; border-top: 1px solid #f3f4f6; font-size: 0.88rem; color: #374151; }
    .table tr:hover td { background: #fafafa; }
    .sku { font-family: monospace; color: #6b7280; font-size: 0.8rem; }
    .product-name { font-weight: 600; color: #1a1f36; }
    .product-desc { font-size: 0.78rem; color: #9ca3af; margin-top: 2px; }
    .price { font-weight: 600; color: #059669; }
    .stock { font-weight: 600; }
    .badge-cat { background: #eff6ff; color: #3b82f6; padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 600; }
    .badge-ok { background: #f0fdf4; color: #16a34a; }
    .badge-low { background: #fff7ed; color: #d97706; }
    .badge-out { background: #fef2f2; color: #dc2626; }
    .action-btns { display: flex; gap: 6px; }
    .btn-icon { border: none; background: none; cursor: pointer; font-size: 1rem; padding: 4px 6px; border-radius: 6px; transition: background 0.15s; }
    .btn-icon:hover { background: #f3f4f6; }
    .empty { text-align: center; padding: 40px; color: #9ca3af; }
    .pagination { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-top: 1px solid #f3f4f6; }
    .page-info { font-size: 0.85rem; color: #6b7280; }
    .page-btns { display: flex; align-items: center; gap: 10px; }
    .page-btns button { padding: 6px 12px; border: 1px solid #e5e7eb; background: white; border-radius: 6px; cursor: pointer; }
    .page-btns button:disabled { opacity: 0.4; cursor: default; }
    .page-btns span { font-size: 0.85rem; color: #374151; }
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover { background: #4f46e5; }
    .btn-secondary { background: #f3f4f6; color: #374151; }
    .btn-secondary:hover { background: #e5e7eb; }
    .btn-danger { background: #ef4444; color: white; }
    .btn-danger:hover { background: #dc2626; }
    .btn:disabled { opacity: 0.6; cursor: default; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: white; border-radius: 16px; width: 100%; max-width: 560px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .modal-sm { max-width: 400px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: #9ca3af; }
    .modal-form { padding: 20px 24px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; outline: none;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; }
    .error { font-size: 0.78rem; color: #dc2626; }
    .alert-error { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 12px; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f3f4f6; }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  saving = false;
  showModal = false;
  showDeleteConfirm = false;
  editingProduct: Product | null = null;
  deletingProduct: Product | null = null;
  errorMsg = '';
  searchTerm = '';
  selectedCategory = '';
  currentPage = 0;
  pageInfo: PageResponse<Product> | null = null;
  productForm: FormGroup;
  private searchTimeout: any;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      description: [''],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      sku: ['']
    });
  }

  ngOnInit() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAll({
      search: this.searchTerm,
      category: this.selectedCategory,
      page: this.currentPage,
      size: 10
    }).subscribe({
      next: (data) => {
        this.products = data.content;
        this.pageInfo = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadProducts();
    }, 400);
  }

  changePage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  openModal(product?: Product) {
    this.editingProduct = product || null;
    this.errorMsg = '';
    if (product) {
      this.productForm.patchValue(product);
    } else {
      this.productForm.reset({ stock: 0 });
    }
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.errorMsg = '';
    const payload: ProductRequest = this.productForm.value;
    const op = this.editingProduct
      ? this.productService.update(this.editingProduct.id, payload)
      : this.productService.create(payload);

    op.subscribe({
      next: () => { this.saving = false; this.closeModal(); this.loadProducts(); },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.error || 'Error al guardar el producto';
      }
    });
  }

  confirmDelete(product: Product) {
    this.deletingProduct = product;
    this.showDeleteConfirm = true;
  }

  deleteProduct() {
    if (!this.deletingProduct) return;
    this.saving = true;
    this.productService.delete(this.deletingProduct.id).subscribe({
      next: () => { this.saving = false; this.showDeleteConfirm = false; this.loadProducts(); },
      error: () => { this.saving = false; }
    });
  }
}
