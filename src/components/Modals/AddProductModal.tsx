import React, { useState, useEffect } from 'react';
import { X, Search, Package, Info, Scale } from 'lucide-react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Product, PlacedProduct } from '../../types';

const AddProductModal: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { productCatalog, selectedShelfId, isAddProductModalOpen } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    if (isAddProductModalOpen) {
      setSearchTerm('');
      setCategoryFilter(null);
    }
  }, [isAddProductModalOpen]);

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_ADD_PRODUCT_MODAL', payload: false });
  };

  const handleAddProduct = (product: Product) => {
    if (!selectedShelfId) return;

    const placedProduct: PlacedProduct = {
      productId: product.id,
      positionX: 0,
      positionY: 0
    };

    dispatch({
      type: 'ADD_PRODUCT_TO_SHELF',
      payload: { shelfId: selectedShelfId, product: placedProduct }
    });

    handleClose();
  };

  const categories = Array.from(new Set(productCatalog.map(product => product.category)));

  const filteredProducts = productCatalog.filter(product => {
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = categoryFilter
      ? product.category === categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  if (!isAddProductModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-800 animate-fadeIn">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Package className="mr-2 text-blue-400" />
            Product Catalog
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-48">
              <select
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.length > 0 ? filteredProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-400 transition group"
              >
                <div className="aspect-video bg-gray-700 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <Package size={40} className="text-gray-500" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-2">
                    <div className="text-xs bg-gray-800 text-gray-300 inline-block px-2 py-1 rounded">
                      {product.category}
                    </div>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="font-medium text-white mb-1">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">SKU: {product.sku}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <span className="mr-2">Dimensions:</span>
                      <span className="text-gray-300">
                        {product.width}×{product.height}×{product.depth} cm
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm">
                      <span className="text-gray-400">Stock:</span>
                      <span className={`ml-1 ${product.stock > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                        {product.stock} units
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddProduct(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center py-10 text-gray-400">
                <Info size={48} className="mb-4 text-gray-500" />
                <p className="text-lg font-medium mb-1">No products found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;