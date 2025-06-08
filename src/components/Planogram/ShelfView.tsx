import React, { useMemo, useState } from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Package, ChevronLeft, Info, Scale, ArrowLeftRight, Cuboid as Cube, BarChart3, PanelLeftClose, PanelLeftOpen, Trash2, Search } from 'lucide-react';
import DroppableShelf from './DroppableShelf';
import ShelfView3DModal from '../Modals/ShelfView3DModal';
import ShelfAnalytics from '../Analytics/ShelfAnalytics';
import { analyzeShelfCompliance } from '../../utils/optimization';
import DraggableProduct from './DraggableProduct';
import toast from 'react-hot-toast';

const ShelfView: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId, selectedBayId, selectedShelfId, productCatalog } = state;
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);
  const selectedBay = selectedEquipment?.bays.find(bay => bay.id === selectedBayId);
  const selectedShelf = selectedBay?.shelves.find(shelf => shelf.id === selectedShelfId);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set(productCatalog.map(product => product.category));
    return Array.from(uniqueCategories);
  }, [productCatalog]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return productCatalog.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productCatalog, searchTerm, selectedCategory]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!selectedShelf) return null;
    return analyzeShelfCompliance(selectedShelf, productCatalog, selectedShelf.products);
  }, [selectedShelf, productCatalog]);

  // Calculate total weight of products on shelf
  const totalWeight = useMemo(() => {
    if (!selectedShelf) return 0;
    return selectedShelf.products.reduce((total, placedProduct) => {
      const product = productCatalog.find(p => p.id === placedProduct.productId);
      if (!product?.weight) return total;
      return total + (product.weight * (placedProduct.facings || 1)) / 1000;
    }, 0);
  }, [selectedShelf, productCatalog]);

  if (!selectedShelf || !selectedBay) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Info size={64} className="mb-6 text-gray-600" />
        <h2 className="text-2xl font-medium mb-2">No Layer Selected</h2>
        <p className="text-center max-w-md text-gray-500 mb-6">
          Select a layer from the sidebar or bay view to see details and manage products.
        </p>
        <button
          onClick={() => dispatch({ type: 'SELECT_BAY', payload: selectedBayId || '' })}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Bay View
        </button>
      </div>
    );
  }

  const handleBackToBay = () => {
    dispatch({ type: 'SELECT_BAY', payload: selectedBayId || '' });
  };

  const handleDeleteLayer = () => {
    if (confirm('Are you sure you want to delete this layer? This action cannot be undone.')) {
      dispatch({ type: 'REMOVE_SHELF', payload: selectedShelfId });
      dispatch({ type: 'SELECT_BAY', payload: selectedBayId });
      toast.success('Layer deleted successfully');
    }
  };

  const handleProductDrop = (productId: string, placedProduct: PlacedProduct, sourceShelfId: string | null) => {
    if (sourceShelfId) {
      dispatch({
        type: 'REMOVE_PRODUCT_FROM_SHELF',
        payload: { shelfId: sourceShelfId, productId }
      });
    }

    dispatch({
      type: 'ADD_PRODUCT_TO_SHELF',
      payload: { 
        shelfId: selectedShelfId,
        product: {
          ...placedProduct,
          productId
        }
      }
    });
  };

  const handleRemoveProduct = (productId: string) => {
    dispatch({
      type: 'REMOVE_PRODUCT_FROM_SHELF',
      payload: { shelfId: selectedShelfId, productId }
    });
  };

  return (
    <div className="h-full flex">
      {/* Product Catalog Panel */}
      <div className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
        showCatalog ? 'w-80' : 'w-0 overflow-hidden'
      }`}>
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Package size={18} className="mr-2 text-blue-400" />
            Product Catalog
          </h3>
          
          {/* Search Input */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-2 w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="p-4 space-y-2 h-[calc(100vh-12rem)] overflow-y-auto">
          {filteredProducts.map(product => (
            <DraggableProduct
              key={product.id}
              product={product}
              placedProduct={{ productId: product.id, positionX: 0, positionY: 0, facings: 1, orientation: 'front' }}
              shelfId=""
              onRemove={() => {}}
              pixelsPerCm={6}
              variant="list"
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center mb-1">
              <button
                onClick={handleBackToBay}
                className="mr-2 p-1 rounded hover:bg-gray-800 transition"
              >
                <ChevronLeft size={20} className="text-gray-400" />
              </button>
              <h2 className="text-2xl font-semibold text-white">{selectedShelf.name}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition"
              title={showCatalog ? 'Hide catalog' : 'Show catalog'}
            >
              {showCatalog ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 text-white rounded-md transition flex items-center ${
                showAnalytics ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <BarChart3 size={18} className="mr-2" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </button>
            <button
              onClick={() => setIs3DModalOpen(true)}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition flex items-center"
            >
              <Cube size={18} className="mr-2" />
              View 3D
            </button>
            <button
              onClick={handleDeleteLayer}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition flex items-center"
              title="Delete layer"
            >
              <Trash2 size={18} className="mr-2" />
              Delete Layer
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {showAnalytics && analytics && (
            <div className="mb-6">
              <ShelfAnalytics analytics={analytics} />
            </div>
          )}
          
          <div className="border-2 border-gray-800 rounded-lg p-4 h-full">
            <DroppableShelf
              shelfId={selectedShelf.id}
              products={selectedShelf.products}
              productCatalog={productCatalog}
              maxWeight={selectedShelf.maxWeight}
              width={selectedShelf.width}
              height={selectedShelf.height}
              depth={selectedShelf.depth}
              onProductDrop={handleProductDrop}
              onProductRemove={handleRemoveProduct}
            />
          </div>
        </div>

        <ShelfView3DModal 
          isOpen={is3DModalOpen}
          onClose={() => setIs3DModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default ShelfView;