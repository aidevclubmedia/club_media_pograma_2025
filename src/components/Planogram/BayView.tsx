import React from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Plus, LayoutList, ChevronLeft, Info, Trash2, Scale, ArrowLeftRight as ArrowsLeftRight, Download, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const BayView: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId, selectedBayId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);
  const selectedBay = selectedEquipment?.bays.find(bay => bay.id === selectedBayId);

  if (!selectedBay) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Info size={64} className="mb-6 text-gray-600" />
        <h2 className="text-2xl font-medium mb-2">No Bay Selected</h2>
        <p className="text-center max-w-md text-gray-500 mb-6">
          Select a bay from the sidebar or equipment view to configure it.
        </p>
        <button
          onClick={() => dispatch({ type: 'SELECT_EQUIPMENT', payload: selectedEquipmentId || '' })}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Equipment View
        </button>
      </div>
    );
  }

  const handleAddShelf = () => {
    const newShelf = {
      id: crypto.randomUUID(),
      name: `Layer ${selectedBay.shelves.length + 1}`,
      width: 100,
      height: 60,
      depth: selectedBay.depth,
      maxWeight: 50,
      products: []
    };
    
    dispatch({
      type: 'ADD_SHELF',
      payload: { bayId: selectedBayId, shelf: newShelf }
    });
  };

  const handleBackToEquipment = () => {
    dispatch({ type: 'SELECT_EQUIPMENT', payload: selectedEquipmentId || '' });
  };

  const handleDeleteShelf = (shelfId: string) => {
    if (confirm('Are you sure you want to delete this layer? This action cannot be undone.')) {
      dispatch({ type: 'REMOVE_SHELF', payload: shelfId });
    }
  };

  const handleExportLayout = async () => {
    try {
      const response = await fetch('/images/Export_Bay_Layout.png');
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bay-layout.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export layout:', error);
      alert('Failed to export layout. Please try again.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/Export_Bay_Layout.pdf');
      if (!response.ok) throw new Error('Failed to fetch PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bay-layout.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const renderProductFacings = (shelf, product, facings) => {
    const images = [];
    for (let i = 0; i < facings; i++) {
      images.push(
        <div 
          key={`${product.id}-${i}`} 
          className="flex-shrink-0"
          style={{
            width: `${Math.max(60, Math.min(100, product.width * 3))}px`,
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center'
          }}
        >
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              style={{
                width: '100%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-700 rounded"></div>
          )}
        </div>
      );
    }
    return images;
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <div className="flex items-center mb-1">
            <button
              onClick={handleBackToEquipment}
              className="mr-2 p-1 rounded hover:bg-gray-800 transition"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h2 className="text-2xl font-semibold text-white">{selectedBay.name}</h2>
          </div>
          <div className="flex items-center space-x-4 text-gray-400">
            <div className="flex items-center bg-gray-800 px-3 py-1.5 rounded">
              <ArrowsLeftRight size={16} className="mr-2 text-blue-400" />
              Bay Width: {selectedBay.width} cm
            </div>
            <p>Height: {selectedBay.height} cm</p>
            <p>Depth: {selectedBay.depth} cm</p>
            <div className="flex items-center">
              <Scale size={16} className="mr-1" />
              Max Weight: {selectedBay.maxWeight} kg
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportLayout}
            className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition"
            aria-label="Export PNG"
            title="Export PNG"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleExportPDF}
            className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
            aria-label="Export PDF"
            title="Export PDF"
          >
            <FileDown size={20} />
          </button>
          <button
            onClick={handleAddShelf}
            className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
            aria-label="Add Layer"
            title="Add Layer"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {selectedBay.shelves.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-800 rounded-lg p-8">
          <LayoutList size={48} className="mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No Layers Added</h3>
          <p className="text-center max-w-md text-gray-500 mb-6">
            Add layers to this bay to start placing products.
          </p>
          <button
            onClick={handleAddShelf}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <LayoutList size={18} className="mr-2" />
            Add First Layer
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 border-2 border-gray-800 rounded-lg p-4">
            <div className="bay-content bg-gray-900 rounded-lg h-full relative flex flex-col overflow-hidden">
              <div className="h-2 bg-gray-800 rounded-full mb-4 flex-shrink-0"></div>
              
              <div className="flex-1 overflow-y-auto space-y-4 px-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {selectedBay.shelves.map((shelf) => (
                  <div 
                    key={shelf.id} 
                    className="border-2 border-[#111827] hover:border-blue-500 transition rounded-md bg-gray-800 overflow-hidden"
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => dispatch({ type: 'SELECT_SHELF', payload: shelf.id })}
                    >
                      {shelf.products.length === 0 ? (
                        <div className="bg-gray-900 p-4 text-center text-gray-500 text-sm flex items-center justify-center h-[200px]">
                          <span>No products placed on this layer</span>
                        </div>
                      ) : (
                        <div className="bg-gray-900">
                          <div className="flex h-[200px]">
                            {shelf.products.map((placedProduct) => {
                              const product = state.productCatalog.find(p => p.id === placedProduct.productId);
                              if (!product) return null;
                              return renderProductFacings(shelf, product, placedProduct.facings || 1);
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="h-2 bg-gray-800 rounded-full mt-4 flex-shrink-0"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BayView;