import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { DashboardStats } from '../../models/product.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p class="subtitle">Resumen del inventario</p>
    </div>

    <div *ngIf="loading" class="loading">Cargando...</div>

    <div *ngIf="!loading && stats" class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalProducts }}</div>
          <div class="stat-label">Total Productos</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">⚠️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.lowStockProducts }}</div>
          <div class="stat-label">Stock Bajo</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">🚫</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.outOfStockProducts }}</div>
          <div class="stat-label">Sin Stock</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">💰</div>
        <div class="stat-info">
          <div class="stat-value">\${{ stats.totalInventoryValue | number:'1.2-2' }}</div>
          <div class="stat-label">Valor Total</div>
        </div>
      </div>
    </div>

    <div *ngIf="!loading && stats" class="section">
      <h2>Productos por Categoría</h2>
      <div class="category-grid">
        <div *ngFor="let cat of getCategories()" class="category-card">
          <span class="cat-name">{{ cat.key }}</span>
          <span class="cat-count">{{ cat.value }}</span>
        </div>
        <div *ngIf="getCategories().length === 0" class="empty-cats">
          Sin categorías. <a routerLink="/products">Agrega productos</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    .page-header h1 { font-size: 1.8rem; font-weight: 700; color: #1a1f36; margin: 0; }
    .subtitle { color: #6b7280; margin: 4px 0 0; }
    .loading { padding: 40px; text-align: center; color: #6b7280; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 36px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
    }
    .stat-icon {
      width: 52px; height: 52px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
    }
    .stat-icon.blue { background: #eff6ff; }
    .stat-icon.orange { background: #fff7ed; }
    .stat-icon.red { background: #fef2f2; }
    .stat-icon.green { background: #f0fdf4; }
    .stat-value { font-size: 1.6rem; font-weight: 700; color: #1a1f36; }
    .stat-label { font-size: 0.82rem; color: #6b7280; margin-top: 2px; }
    .section h2 { font-size: 1.1rem; font-weight: 700; color: #1a1f36; margin-bottom: 16px; }
    .category-grid {
      display: flex; flex-wrap: wrap; gap: 12px;
    }
    .category-card {
      background: white;
      border-radius: 10px;
      padding: 14px 20px;
      display: flex; flex-direction: column; align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.07);
      min-width: 130px;
    }
    .cat-name { font-weight: 600; color: #374151; font-size: 0.88rem; }
    .cat-count {
      font-size: 1.6rem; font-weight: 700; color: #6366f1; margin-top: 4px;
    }
    .empty-cats { color: #9ca3af; padding: 20px; }
    .empty-cats a { color: #6366f1; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getDashboard().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getCategories(): { key: string; value: number }[] {
    if (!this.stats?.productsByCategory) return [];
    return Object.entries(this.stats.productsByCategory)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }
}
