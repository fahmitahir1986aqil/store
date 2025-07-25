/**
 * Custom hook for inventory management
 */

import { useState, useEffect } from 'react';
import { InventoryItem, StockTransaction, ItemType, Department, ExpiryAlert } from '../types/inventory';

export const useInventory = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([
    { id: '1', name: 'Stationery' },
    { id: '2', name: 'Cleaning Supplies' },
    { id: '3', name: 'Food & Beverages' },
  ]);
  const [departments, setDepartments] = useState<Department[]>([
    { id: '1', name: 'Admin' },
    { id: '2', name: 'IT' },
    { id: '3', name: 'HR' },
  ]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('inventory-items');
    const savedTransactions = localStorage.getItem('inventory-transactions');
    const savedTypes = localStorage.getItem('inventory-types');
    const savedDepartments = localStorage.getItem('inventory-departments');

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedTypes) setItemTypes(JSON.parse(savedTypes));
    if (savedDepartments) setDepartments(JSON.parse(savedDepartments));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('inventory-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('inventory-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('inventory-types', JSON.stringify(itemTypes));
  }, [itemTypes]);

  useEffect(() => {
    localStorage.setItem('inventory-departments', JSON.stringify(departments));
  }, [departments]);

  /**
   * Generate unique barcode
   */
  const generateBarcode = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  /**
   * Add new inventory item
   */
  const addItem = (item: Omit<InventoryItem, 'id' | 'barcode' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
      barcode: generateBarcode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [...prev, newItem]);
    return newItem;
  };

  /**
   * Update inventory item
   */
  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
      )
    );
  };

  /**
   * Delete inventory item
   */
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    setTransactions(prev => prev.filter(trans => trans.itemId !== id));
  };

  /**
   * Add stock transaction
   */
  const addTransaction = (transaction: Omit<StockTransaction, 'id' | 'date'>) => {
    const newTransaction: StockTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date(),
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
    // Update current stock
    setItems(prev =>
      prev.map(item =>
        item.id === transaction.itemId
          ? {
              ...item,
              currentStock: transaction.type === 'in' 
                ? item.currentStock + transaction.quantity
                : item.currentStock - transaction.quantity,
              updatedAt: new Date(),
            }
          : item
      )
    );
  };

  /**
   * Get expiry alerts
   */
  const getExpiryAlerts = (): ExpiryAlert[] => {
    const alerts: ExpiryAlert[] = [];
    const now = new Date();
    
    items.forEach(item => {
      if (item.hasExpiry && item.expiryDays) {
        const expiryDate = new Date(item.updatedAt);
        expiryDate.setDate(expiryDate.getDate() + item.expiryDays);
        
        const timeDiff = expiryDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysLeft <= 60) {
          alerts.push({
            item,
            daysLeft,
            status: daysLeft <= 10 ? 'critical' : daysLeft <= 30 ? 'warning' : 'normal',
          });
        }
      }
    });
    
    return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
  };

  /**
   * Get low stock alerts
   */
  const getLowStockAlerts = (): InventoryItem[] => {
    return items.filter(item => item.currentStock <= item.lowStockAlert);
  };

  /**
   * Find item by barcode
   */
  const findItemByBarcode = (barcode: string): InventoryItem | undefined => {
    console.log('Searching for barcode:', barcode);
    console.log('Available items:', items.map(item => ({ name: item.name, barcode: item.barcode })));
    const found = items.find(item => item.barcode === barcode.trim());
    console.log('Found item:', found);
    return found;
  };

  return {
    items,
    transactions,
    itemTypes,
    departments,
    addItem,
    updateItem,
    deleteItem,
    addTransaction,
    getExpiryAlerts,
    getLowStockAlerts,
    findItemByBarcode,
    setItemTypes,
    setDepartments,
  };
};
