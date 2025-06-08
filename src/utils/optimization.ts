import { 
  Shelf, 
  Product, 
  PlacedProduct, 
  ShelfAnalytics, 
  ComplianceIssue,
  OptimizationSuggestion,
  CategoryPerformance
} from '../types';

export function analyzeShelfCompliance(
  shelf: Shelf, 
  products: Product[], 
  placedProducts: PlacedProduct[]
): ShelfAnalytics {
  const issues: ComplianceIssue[] = [];
  let totalWidth = 0;
  let totalWeight = 0;
  let totalSales = 0;
  let totalProfit = 0;
  let totalInventoryTurn = 0;
  let totalDaysOfSupply = 0;
  let productCount = 0;

  // Analyze each placed product
  placedProducts.forEach(placement => {
    const product = products.find(p => p.id === placement.productId);
    if (!product) return;

    const facings = placement.facings || 1;
    productCount++;

    // Calculate space usage
    const productWidth = placement.orientation === 'front' 
      ? product.width * facings
      : product.depth * facings;
    totalWidth += productWidth;

    // Calculate weight
    totalWeight += (product.weight * facings) / 1000; // Convert to kg

    // Calculate sales and profit
    const dailySales = product.salesVelocity * facings;
    totalSales += dailySales;
    totalProfit += dailySales * product.profitMargin;

    // Calculate inventory metrics
    const daysOfSupply = product.stock / (product.salesVelocity * facings);
    totalDaysOfSupply += daysOfSupply;
    totalInventoryTurn += (product.salesVelocity * 365) / product.stock;

    // Check facing compliance
    if (product.minFacings && facings < product.minFacings) {
      const potentialSales = product.salesVelocity * (product.minFacings - facings);
      const potentialProfit = potentialSales * product.profitMargin;
      
      issues.push({
        type: 'facing',
        severity: 'high',
        message: `${product.name} has ${facings} facings, minimum required is ${product.minFacings}`,
        productId: product.id,
        recommendation: `Increase facings to at least ${product.minFacings}`,
        impact: {
          sales: potentialSales,
          profit: potentialProfit
        }
      });
    }

    // Check inventory levels
    if (daysOfSupply < 2) {
      issues.push({
        type: 'inventory',
        severity: 'high',
        message: `Low stock for ${product.name} (${daysOfSupply.toFixed(1)} days of supply)`,
        productId: product.id,
        recommendation: 'Restock soon to prevent stockouts',
        impact: {
          daysOfSupply: 2 - daysOfSupply
        }
      });
    }
  });

  // Check shelf weight capacity
  if (shelf.maxWeight && totalWeight > shelf.maxWeight) {
    issues.push({
      type: 'weight',
      severity: 'high',
      message: `Shelf weight load (${totalWeight.toFixed(1)}kg) exceeds maximum capacity (${shelf.maxWeight}kg)`,
      recommendation: 'Remove items or redistribute to other shelves'
    });
  }

  // Calculate performance metrics
  const averageInventoryTurn = productCount > 0 ? totalInventoryTurn / productCount : 0;
  const averageDaysOfSupply = productCount > 0 ? totalDaysOfSupply / productCount : 0;
  const salesPerCm = totalWidth > 0 ? totalSales / totalWidth : 0;
  const profitPerCm = totalWidth > 0 ? totalProfit / totalWidth : 0;

  return {
    spaceUtilization: (totalWidth / shelf.width) * 100,
    facingCount: placedProducts.reduce((sum, p) => sum + (p.facings || 1), 0),
    totalProducts: productCount,
    weightLoad: totalWeight,
    salesPotential: totalSales,
    profitPotential: totalProfit,
    complianceIssues: issues,
    performance: {
      totalSales,
      totalProfit,
      salesPerCm,
      profitPerCm,
      averageInventoryTurn,
      daysOfSupply: averageDaysOfSupply
    }
  };
}

export function generateOptimizationSuggestions(
  shelf: Shelf,
  products: Product[],
  analytics: ShelfAnalytics
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Space optimization suggestions
  if (analytics.spaceUtilization < 85) {
    suggestions.push({
      type: 'space',
      priority: 80,
      currentValue: analytics.spaceUtilization,
      suggestedValue: 95,
      impact: {
        sales: analytics.salesPotential * 0.15,
        profit: analytics.profitPotential * 0.15,
        spaceUtilization: 95 - analytics.spaceUtilization
      },
      message: 'Shelf space underutilized. Consider adding more products or increasing facings.'
    });
  }

  // Analyze each product for facing optimization
  shelf.products.forEach(placement => {
    const product = products.find(p => p.id === placement.productId);
    if (!product) return;

    // Calculate optimal facings based on sales velocity
    const optimalFacings = Math.ceil(product.salesVelocity * 1.5); // 1.5 days of stock
    if (placement.facings < optimalFacings && product.maxFacings && optimalFacings <= product.maxFacings) {
      const additionalFacings = optimalFacings - placement.facings;
      const additionalSales = product.salesVelocity * additionalFacings;
      const additionalProfit = additionalSales * product.profitMargin;
      
      suggestions.push({
        type: 'facing',
        priority: 70,
        currentValue: placement.facings,
        suggestedValue: optimalFacings,
        impact: {
          sales: additionalSales,
          profit: additionalProfit,
          spaceUtilization: (product.width * additionalFacings / shelf.width) * 100,
          daysOfSupply: (product.stock / product.salesVelocity) - placement.facings
        },
        message: `Increase ${product.name} facings to match sales velocity`,
        productId: product.id
      });
    }
  });

  return suggestions.sort((a, b) => b.priority - a.priority);
}

export function analyzeCategoryPerformance(
  shelf: Shelf,
  products: Product[]
): CategoryPerformance[] {
  const categories = new Map<string, CategoryPerformance>();

  // Initialize category data
  shelf.products.forEach(placement => {
    const product = products.find(p => p.id === placement.productId);
    if (!product) return;

    if (!categories.has(product.category)) {
      categories.set(product.category, {
        category: product.category,
        salesVelocity: 0,
        profitMargin: 0,
        spaceShare: 0,
        salesShare: 0,
        profitShare: 0,
        daysOfSupply: 0,
        inventoryTurn: 0,
        salesPerCm: 0,
        profitPerCm: 0
      });
    }

    const categoryData = categories.get(product.category)!;
    const facings = placement.facings || 1;
    const productWidth = placement.orientation === 'front' 
      ? product.width * facings
      : product.depth * facings;

    // Update category metrics
    categoryData.spaceShare += productWidth;
    categoryData.salesVelocity += product.salesVelocity * facings;
    categoryData.profitMargin += product.profitMargin * facings;
    categoryData.daysOfSupply += product.stock / (product.salesVelocity * facings);
    categoryData.inventoryTurn += (product.salesVelocity * 365) / product.stock;
    categoryData.salesPerCm += (product.salesVelocity * facings) / productWidth;
    categoryData.profitPerCm += (product.salesVelocity * product.profitMargin * facings) / productWidth;
  });

  // Calculate shares
  const totalSpace = Array.from(categories.values()).reduce((sum, cat) => sum + cat.spaceShare, 0);
  const totalSales = Array.from(categories.values()).reduce((sum, cat) => sum + cat.salesVelocity, 0);
  const totalProfit = Array.from(categories.values()).reduce((sum, cat) => sum + (cat.salesVelocity * cat.profitMargin), 0);

  return Array.from(categories.values()).map(category => ({
    ...category,
    spaceShare: (category.spaceShare / totalSpace) * 100,
    salesShare: (category.salesVelocity / totalSales) * 100,
    profitShare: (category.profitMargin / totalProfit) * 100,
    daysOfSupply: category.daysOfSupply,
    inventoryTurn: category.inventoryTurn,
    salesPerCm: category.salesPerCm,
    profitPerCm: category.profitPerCm
  }));
}