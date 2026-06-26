// src/app/models/product.model.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
  stockStatus: 'OK' | 'LOW' | 'OUT';
}

export interface ProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  productsByCategory: { [key: string]: number };
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
}
