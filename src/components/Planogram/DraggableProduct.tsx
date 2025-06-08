import React from 'react';
import { useDrag } from 'react-dnd';
import { Package, Scale } from 'lucide-react';
import { Product, PlacedProduct } from '../../types';

interface DraggableProductProps {
  product: Product;
  placedProduct: PlacedProduct;
  shelfId: string;
  onRemove: () => void;
  pixelsPerCm: number;
  variant: 'shelf' | 'list';
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ 
  product, 
  placedProduct,
  shelfId,
  onRemove,
  pixelsPerCm,
  variant
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PRODUCT',
    item: { 
      productId: product.id,
      placedProduct,
      product,
      sourceShelfId: shelfId
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }), [product.id, shelfId, placedProduct]);

  if (variant === 'list') {
    return (
      <div 
        ref={drag}
        className={`bg-gray-800 rounded p-2 flex items-center justify-between group hover:bg-gray-750 transition cursor-move ${
          isDragging ? 'opacity-50' : ''
        }`}
      >
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-gray-400 hover:text-red-400 rounded opacity-0 group-hover:opacity-100"
        >
          <Package size={14} />
        </button>
      </div>
    );
  }

  // Calculate dimensions while maintaining aspect ratio
  const aspectRatio = product.height / product.width;
  const facings = placedProduct.facings || 1;
  const maxWidth = Math.min(150, product.width * pixelsPerCm);
  const maxHeight = Math.min(300, product.height * pixelsPerCm);
  
  let displayWidth, displayHeight;
  
  if (aspectRatio > 1.5) {
    displayHeight = maxHeight;
    displayWidth = displayHeight / aspectRatio;
  } else {
    displayWidth = maxWidth;
    displayHeight = displayWidth * aspectRatio;
  }

  displayWidth = Math.max(60, displayWidth);
  displayHeight = Math.max(150, displayHeight);

  // Calculate total width for all facings
  const totalWidth = displayWidth * facings;

  return (
    <div 
      ref={drag}
      className={`relative flex-shrink-0 border border-[#111827] rounded bg-gray-1000 group hover:border-blue-400 transition flex flex-col justify-end ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{
        width: `${totalWidth}px`,
        height: `${displayHeight}px`,
        cursor: 'move'
      }}
    >
      <div className="flex-1 flex items-end justify-start w-full">
        {Array.from({ length: facings }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 flex items-end justify-center h-full"
            style={{ width: `${displayWidth}px` }}
          >
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={`${product.name} facing ${index + 1}`}
                className="max-w-full max-h-full object-contain"
                style={{
                  width: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Package size={20} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 p-1 bg-black bg-opacity-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Package size={10} className="text-white" />
      </button>

      {/* Facings indicator */}
      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black bg-opacity-50 rounded text-xs text-white">
        {facings}×
      </div>
    </div>
  );
};

export default DraggableProduct;