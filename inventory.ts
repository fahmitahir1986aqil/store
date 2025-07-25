/**
 * Type definitions for inventory management system
 */

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  department: string;
  hasExpiry: boolean;
  expiryDays?: number;
  image?: string;
  barcode: string;
  pricePerPiece: number;
  currentStock: number;
  lowStockAlert: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  picName?: string;
  date: Date;
  notes?: string;
}

export interface ItemType {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface User {
  username: string;
  password: string;
}

export interface ExpiryAlert {
  item: InventoryItem;
  daysLeft: number;
  status: 'critical' | 'warning' | 'normal';
}
