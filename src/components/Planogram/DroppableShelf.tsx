import React, { useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { Package, Scale, Hash } from 'lucide-react';
import { Product, PlacedProduct } from '../../types';
import DraggableProduct from './DraggableProduct';
import toast from 'react-hot-toast';

interface DroppableShelfProps {
  shelfId: string;
  products: PlacedProduct[];
  productCatalog: Product[];
  maxWeight: number;
  width: number;
  height: number;
  depth: number;
  onProductDrop: (productId: string, placedProduct: PlacedProduct, sourceShelfId: string | null) => void;
  onProductRemove: (productId: string) => void;
}

const DroppableShelf: React.FC<DroppableShelfProps> = ({
  shelfId,
  products,
  productCatalog,
  maxWeight,
  width,
  height,
  depth,
  onProductDrop,
  onProductRemove
}) => {
  const metrics = useMemo(() => {
    let totalWidth = 0;
    let totalWeight = 0;
    let totalProducts = 0;
    let totalStock = 0;
    let usedStock = new Map<string, number>();

    products.forEach(placedProduct => {
      const product = productCatalog.find(p => p.id === placedProduct.productId);
      if (!product) return;

      const facings = placedProduct.facings || 1;
      totalProducts += facings;
      
      const currentUsed = usedStock.get(product.id) || 0;
      usedStock.set(product.id, currentUsed + facings);
      
      totalWeight += (product.weight / 1000) * facings;
      totalWidth += product.width * facings;
    });

    productCatalog.forEach(product => {
      totalStock += product.stock;
    });

    const spaceUtilization = (totalWidth / width) * 100;
    const remainingSpace = width - totalWidth;

    return {
      totalWeight,
      totalWidth,
      totalProducts,
      totalStock,
      usedStock,
      spaceUtilization,
      remainingSpace,
      remainingWeight: maxWeight - totalWeight
    };
  }, [products, productCatalog, width, maxWeight]);

  const PIXELS_PER_CM = 6;
  const shelfWidthPx = width * PIXELS_PER_CM;
  const shelfHeightPx = height * PIXELS_PER_CM;

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'PRODUCT',
    canDrop: (item: { product: Product, sourceShelfId: string, placedProduct: PlacedProduct }) => {
      const product = item.product;
      
      if (product.height > height) {
        toast.error(`Product height (${product.height}cm) exceeds layer height (${height}cm)`);
        return false;
      }

      if (product.depth > depth) {
        toast.error(`Product depth (${product.depth}cm) exceeds layer depth (${depth}cm)`);
        return false;
      }

      const productWidth = product.width;
      if (productWidth > metrics.remainingSpace) {
        toast.error(`Not enough layer space (${metrics.remainingSpace.toFixed(1)}cm remaining)`);
        return false;
      }

      const productWeight = product.weight / 1000;
      const existingProductWeight = item.sourceShelfId === shelfId ? productWeight : 0;
      const newTotalWeight = metrics.totalWeight - existingProductWeight + productWeight;

      if (newTotalWeight > maxWeight) {
        toast.error(`Would exceed layer weight limit (${metrics.remainingWeight.toFixed(1)}kg remaining)`);
        return false;
      }

      const currentUsed = metrics.usedStock.get(product.id) || 0;
      const facings = item.placedProduct.facings || 1;
      
      const adjustedUsed = item.sourceShelfId === shelfId ? 
        currentUsed - facings : currentUsed;
      
      if (adjustedUsed + facings > product.stock) {
        toast.error(`Not enough stock available (${product.stock - adjustedUsed} units remaining)`);
        return false;
      }

      return true;
    },
    drop: (item: { productId: string, placedProduct: PlacedProduct, sourceShelfId: string }) => {
      onProductDrop(item.productId, item.placedProduct, item.sourceShelfId);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }), [metrics, height, depth, maxWeight, shelfId]);

  return (
    <div className="space-y-4">
      {/* Layer metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Space Used</div>
          <div className="mt-1 flex items-end justify-between">
            <div className={`text-lg font-medium ${metrics.spaceUtilization > 100 ? 'text-red-400' : 'text-white'}`}>
              {metrics.spaceUtilization.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400">
              {metrics.totalWidth.toFixed(1)}cm / {width}cm
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                metrics.spaceUtilization > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, metrics.spaceUtilization)}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Weight Load</div>
          <div className="mt-1 flex items-end justify-between">
            <div className={`text-lg font-medium ${metrics.totalWeight > maxWeight ? 'text-red-400' : 'text-white'}`}>
              {metrics.totalWeight.toFixed(1)} kg
            </div>
            <div className="text-sm text-gray-400">
              {metrics.remainingWeight.toFixed(1)}kg free
            </div>
          </div>
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                metrics.totalWeight > maxWeight ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (metrics.totalWeight / maxWeight) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Products</div>
          <div className="mt-1 text-lg font-medium text-white">
            {metrics.totalProducts}
          </div>
          <div className="mt-2 text-sm text-gray-400 flex items-center">
            <Hash size={14} className="mr-1" />
            {metrics.totalStock} in stock
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-3">
          <div className="text-sm text-gray-400">Dimensions</div>
          <div className="mt-1 text-lg font-medium text-white">
            {width}×{height} cm
          </div>
          <div className="mt-2 text-sm text-gray-400">
            {depth}cm depth
          </div>
        </div>
      </div>

      {/* Layer visualization */}
      <div 
        ref={drop}
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${
          isOver && canDrop ? 'border-2 border-blue-500 border-dashed' : 
          isOver && !canDrop ? 'border-2 border-red-500 border-dashed' :
          'border-2 border-gray-800'
        }`}
        style={{
          height: `${shelfHeightPx}px`,
          width: `${shelfWidthPx}px`
          //minHeight: '240px' // Increased from 240px to 360px
        }}
      >
        {products.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 text-sm">
            <Package size={32} className="mb-2" />
            <span>Drop products here</span>
          </div>
        ) : (
          <div className="absolute bottom-0 left-0 flex items-end p-2 gap-0 overflow-x-auto h-full">
            {products.map((placedProduct, index) => {
              const product = productCatalog.find(p => p.id === placedProduct.productId);
              if (!product) return null;
              
              return (
                <DraggableProduct
                  key={`${product.id}-${index}`}
                  product={product}
                  placedProduct={placedProduct}
                  shelfId={shelfId}
                  onRemove={() => onProductRemove(product.id)}
                  pixelsPerCm={PIXELS_PER_CM}
                  variant="shelf"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Product list */}
      {products.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Products on Layer</h3>
          <div className="space-y-2">
            {products.map((placedProduct, index) => {
              const product = productCatalog.find(p => p.id === placedProduct.productId);
              if (!product) return null;

              const usedStock = metrics.usedStock.get(product.id) || 0;
              const remainingStock = product.stock - usedStock;

              return (
                <div key={`list-${product.id}-${index}`} className="bg-gray-800 rounded p-2 flex items-center justify-between group hover:bg-gray-750 transition">
                  <div className="flex items-center space-x-3">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-8 h-8 object-contain bg-gray-900 rounded"
                      />
                    ) : (
                      <Package size={16} className="text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{product.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>{product.width}×{product.height}×{product.depth} cm</span>
                        <span className="flex items-center">
                          <Scale size={10} className="mr-1" />
                          {(product.weight / 1000).toFixed(1)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <span className="font-medium text-white">{placedProduct.facings || 1}</span> facings
                      <span className="mx-1">•</span>
                      <span className={`font-medium ${remainingStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {remainingStock}
                      </span> remaining
                    </div>
                    <button
                      onClick={() => onProductRemove(product.id)}
                      className="p-1 text-gray-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"
                    >
                      <Package size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DroppableShelf;