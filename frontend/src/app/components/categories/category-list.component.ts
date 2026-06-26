import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h1>Categorías</h1>
        <p class="subtitle">Administra las categorías de productos</p>
      </div>
    </div>

    <div class="layout">
      <!-- Form -->
      <div class="form-card">
        <h2>Nueva Categoría</h2>
        <div class="form-group">
          <label>Nombre *</label>
          <input type="text" [(ngModel)]="newName" placeholder="Ej: Electrónica" maxlength="80" />
        </div>
        <div class="form-group">
          <label>Descripción</label>
          <textarea [(ngModel)]="newDescription" rows="2" placeholder="Descripción opcional..."></textarea>
        </div>
        <div *ngIf="errorMsg" class="alert-error">{{ errorMsg }}</div>
        <button class="btn btn-primary" (click)="createCategory()" [disabled]="saving || !newName.trim()">
          {{ saving ? 'Guardando...' : '+ Agregar' }}
        </button>
      </div>

      <!-- List -->
      <div class="list-card">
        <div *ngIf="loading" class="loading">Cargando...</div>
        <div *ngIf="!loading && categories.length === 0" class="empty">Sin categorías creadas.</div>
        <div class="cat-list">
          <div *ngFor="let cat of categories" class="cat-item">
            <div>
              <div class="cat-name">{{ cat.name }}</div>
              <div class="cat-desc" *ngIf="cat.description">{{ cat.description }}</div>
            </div>
            <button class="btn-icon" (click)="confirmDelete(cat)" title="Eliminar">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div class="modal-overlay" *ngIf="showConfirm" (click)="showConfirm = false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Confirmar eliminación</h2>
        </div>
        <p style="padding: 0 24px 16px; color: #374151;">
          ¿Eliminar la categoría <strong>{{ deletingCat?.name }}</strong>?
        </p>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showConfirm = false">Cancelar</button>
          <button class="btn btn-danger" (click)="deleteCategory()" [disabled]="saving">Eliminar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .subtitle { color: #6b7280; margin: 4px 0 0; }
    .layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
    .form-card, .list-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.07); }
    .form-card h2, .list-card h2 { font-size: 1rem; font-weight: 700; margin: 0 0 20px; color: #1a1f36; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .form-group label { font-size: 0.82rem; font-weight: 600; color: #374151; }
    .form-group input, .form-group textarea { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.9rem; outline: none; }
    .form-group input:focus, .form-group textarea:focus { border-color: #6366f1; }
    .alert-error { background: #fef2f2; color: #dc2626; padding: 10px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 12px; }
    .btn { padding: 10px 20px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-primary { background: #6366f1; color: white; }
    .btn-primary:hover:not(:disabled) { background: #4f46e5; }
    .btn:disabled { opacity: 0.6; cursor: default; }
    .loading { padding: 20px; text-align: center; color: #6b7280; }
    .empty { padding: 20px; text-align: center; color: #9ca3af; }
    .cat-list { display: flex; flex-direction: column; gap: 8px; }
    .cat-item { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #f9fafb; border-radius: 8px; }
    .cat-name { font-weight: 600; color: #1a1f36; }
    .cat-desc { font-size: 0.8rem; color: #9ca3af; margin-top: 2px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 6px; border-radius: 6px; }
    .btn-icon:hover { background: #fee2e2; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: white; border-radius: 16px; width: 100%; max-width: 380px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .modal-header { padding: 20px 24px 16px; }
    .modal-header h2 { font-size: 1.1rem; font-weight: 700; margin: 0; color: #1a1f36; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 8px 24px 20px; }
    .btn-secondary { background: #f3f4f6; color: #374151; padding: 10px 20px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; width: auto; }
    .btn-danger { background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer; width: auto; }
    @media (max-width: 768px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  saving = false;
  newName = '';
  newDescription = '';
  errorMsg = '';
  showConfirm = false;
  deletingCat: Category | null = null;

  constructor(private categoryService: CategoryService) {}

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.loading = true;
    this.categoryService.getAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  createCategory() {
    if (!this.newName.trim()) return;
    this.saving = true;
    this.errorMsg = '';
    this.categoryService.create({ name: this.newName.trim(), description: this.newDescription.trim() }).subscribe({
      next: () => { this.saving = false; this.newName = ''; this.newDescription = ''; this.loadCategories(); },
      error: (err) => { this.saving = false; this.errorMsg = err?.error?.error || 'Error al crear categoría'; }
    });
  }

  confirmDelete(cat: Category) {
    this.deletingCat = cat;
    this.showConfirm = true;
  }

  deleteCategory() {
    if (!this.deletingCat) return;
    this.saving = true;
    this.categoryService.delete(this.deletingCat.id).subscribe({
      next: () => { this.saving = false; this.showConfirm = false; this.loadCategories(); },
      error: () => this.saving = false
    });
  }
}
