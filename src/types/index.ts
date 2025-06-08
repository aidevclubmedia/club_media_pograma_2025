import { ReactNode } from 'react';

// Define the core data types for the planogram application

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
  imageUrl?: string;
  sku: string;
  category: string;
  stock: number;
  salesVelocity: number; // units sold per day
  profitMargin: number; // percentage as decimal (0.15 = 15%)
  minFacings: number;
  maxFacings: number;
  weight: number; // in grams
  priority: number; // 1-100, higher means more important
  daysOfSupply?: number; // calculated based on stock and sales velocity
  salesPerCm?: number; // calculated based on sales and width
  profitPerCm?: number; // calculated based on profit and width
  inventoryTurn?: number; // calculated based on sales velocity and stock
}

export interface PlacedProduct {
  productId: string;
  positionX: number; // in cm, from left
  positionY: number; // in cm, from top
  facings: number; // number of product facings
  orientation: 'front' | 'side' | 'top'; // product orientation on shelf
  salesData?: {
    dailySales: number;
    profitMargin: number;
    salesPerCm: number;
    profitPerCm: number;
    daysOfSupply: number;
  };
}

export interface Shelf {
  id: string;
  name: string;
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
  maxWeight: number; // maximum weight capacity in kg
  products: PlacedProduct[];
  shelfType: 'standard' | 'refrigerated' | 'promotional';
  temperature?: number; // for refrigerated shelves
  performance?: {
    totalSales: number; // daily sales
    totalProfit: number; // daily profit
    spaceUtilization: number; // percentage
    salesPerCm: number;
    profitPerCm: number;
    averageInventoryTurn: number;
  };
}

export interface Bay {
  id: string;
  name: string;
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
  maxWeight: number; // maximum weight capacity in kg
  shelves: Shelf[];
  category?: string; // primary category for this bay
  flowDirection: 'left-to-right' | 'right-to-left';
  performance?: {
    totalSales: number;
    totalProfit: number;
    spaceUtilization: number;
    salesPerCm: number;
    profitPerCm: number;
  };
}

export interface Equipment {
  id: string;
  name: string;
  type: string; // e.g., "shelf unit", "refrigerator", "display stand"
  width: number; // in cm
  height: number; // in cm
  depth: number; // in cm
  bays: Bay[];
  temperature?: number; // for refrigerated equipment
  performance?: {
    totalSales: number;
    totalProfit: number;
    spaceUtilization: number;
  };
}

export interface Door {
  id: string;
  name: string;
  location: string;
  equipment: Equipment[];
  trafficFlow: number; // customer traffic score (1-100)
  performance?: {
    totalSales: number;
    totalProfit: number;
    spaceUtilization: number;
  };
}

export interface PlanogramState {
  project: Project;
  doors: Door[];
  selectedDoorId: string | null;
  selectedEquipmentId: string | null;
  selectedBayId: string | null;
  selectedShelfId: string | null;
  productCatalog: Product[];
  isAddProductModalOpen: boolean;
  visualizationMode: 'standard' | 'sales-heatmap' | 'profit-heatmap' | 'inventory-heatmap';
}

export interface ShelfAnalytics {
  spaceUtilization: number; // percentage
  facingCount: number;
  totalProducts: number;
  weightLoad: number; // current weight load in kg
  salesPotential: number; // estimated daily sales
  profitPotential: number; // estimated daily profit
  complianceIssues: ComplianceIssue[];
  performance: {
    totalSales: number;
    totalProfit: number;
    salesPerCm: number;
    profitPerCm: number;
    averageInventoryTurn: number;
    daysOfSupply: number;
  };
}

export interface ComplianceIssue {
  type: 'spacing' | 'weight' | 'temperature' | 'facing' | 'category' | 'orientation' | 'inventory';
  severity: 'low' | 'medium' | 'high';
  message: string;
  productId?: string;
  recommendation?: string;
  impact?: {
    sales?: number;
    profit?: number;
    daysOfSupply?: number;
  };
}

export interface OptimizationSuggestion {
  type: 'space' | 'assortment' | 'facing' | 'inventory';
  priority: number;
  currentValue: number;
  suggestedValue: number;
  impact: {
    sales: number;
    profit: number;
    spaceUtilization: number;
    daysOfSupply?: number;
  };
  message: string;
  productId?: string;
}

export interface CategoryPerformance {
  category: string;
  salesVelocity: number;
  profitMargin: number;
  spaceShare: number;
  salesShare: number;
  profitShare: number;
  daysOfSupply: number;
  inventoryTurn: number;
  salesPerCm: number;
  profitPerCm: number;
}

export interface PerformanceMetrics {
  sales: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: number; // percentage change
  };
  profit: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: number;
  };
  inventory: {
    turnover: number;
    daysOfSupply: number;
    stockouts: number;
    excess: number;
  };
  space: {
    utilization: number;
    salesPerCm: number;
    profitPerCm: number;
    efficiency: number; // sales/space ratio
  };
}