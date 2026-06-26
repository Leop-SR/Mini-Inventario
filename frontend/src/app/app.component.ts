import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <nav class="sidebar">
        <div class="sidebar-brand">
          <span class="brand-icon">📦</span>
          <span class="brand-name">MiniInventario</span>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="nav-icon">📊</span> Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/products" routerLinkActive="active">
              <span class="nav-icon">🏷️</span> Productos
            </a>
          </li>
          <li>
            <a routerLink="/categories" routerLinkActive="active">
              <span class="nav-icon">🗂️</span> Categorías
            </a>
          </li>
        </ul>
      </nav>
      <main class="main-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f0f2f5;
    }
    .sidebar {
      width: 240px;
      background: #1a1f36;
      color: white;
      display: flex;
      flex-direction: column;
      padding: 0;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 100;
    }
    .sidebar-brand {
      padding: 24px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .brand-icon { font-size: 1.5rem; }
    .nav-links {
      list-style: none;
      padding: 16px 0;
      margin: 0;
    }
    .nav-links li a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: rgba(255,255,255,0.65);
      text-decoration: none;
      transition: all 0.2s;
      font-size: 0.92rem;
      font-weight: 500;
    }
    .nav-links li a:hover,
    .nav-links li a.active {
      color: white;
      background: rgba(255,255,255,0.08);
      border-left: 3px solid #6366f1;
      padding-left: 17px;
    }
    .nav-icon { font-size: 1.1rem; }
    .main-content {
      margin-left: 240px;
      flex: 1;
      padding: 32px;
      min-height: 100vh;
    }
    @media (max-width: 768px) {
      .sidebar { width: 100%; height: auto; position: relative; }
      .main-content { margin-left: 0; }
      .app-layout { flex-direction: column; }
    }
  `]
})
export class AppComponent {}
