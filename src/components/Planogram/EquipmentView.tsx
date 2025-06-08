import React from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Plus, Grid3X3, ChevronLeft, Info, Trash2 } from 'lucide-react';

const EquipmentView: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);

  if (!selectedEquipment) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Info size={64} className="mb-6 text-gray-600" />
        <h2 className="text-2xl font-medium mb-2">No Equipment Selected</h2>
        <p className="text-center max-w-md text-gray-500 mb-6">
          Select equipment from the sidebar or door view to configure it.
        </p>
        <button
          onClick={() => dispatch({ type: 'SELECT_DOOR', payload: selectedDoorId || '' })}
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition flex items-center"
        >
          <ChevronLeft size={18} className="mr-2" />
          Back to Door View
        </button>
      </div>
    );
  }

  const handleAddBay = () => {
    const newBay = {
      id: crypto.randomUUID(),
      name: `Bay ${selectedEquipment.bays.length + 1}`,
      width: 100,
      height: 200,
      depth: 50,
      maxWeight: 100,
      shelves: []
    };
    
    dispatch({
      type: 'ADD_BAY',
      payload: { equipmentId: selectedEquipmentId, bay: newBay }
    });
  };

  const handleBackToDoor = () => {
    dispatch({ type: 'SELECT_DOOR', payload: selectedDoorId || '' });
  };

  const handleDeleteBay = (bayId: string) => {
    if (confirm('Are you sure you want to delete this bay? This action cannot be undone.')) {
      dispatch({ type: 'REMOVE_BAY', payload: bayId });
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center mb-1">
            <button
              onClick={handleBackToDoor}
              className="mr-2 p-1 rounded hover:bg-gray-800 transition"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <h2 className="text-2xl font-semibold text-white">{selectedEquipment.name}</h2>
          </div>
          <p className="text-gray-400">Type: {selectedEquipment.type}</p>
        </div>
        <button
          onClick={handleAddBay}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Bay
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <div className="bg-gray-800 rounded-md px-3 py-1.5 text-sm text-gray-300">
          <span className="text-gray-400 mr-1">Width:</span>
          {selectedEquipment.width} cm
        </div>
        <div className="bg-gray-800 rounded-md px-3 py-1.5 text-sm text-gray-300">
          <span className="text-gray-400 mr-1">Height:</span>
          {selectedEquipment.height} cm
        </div>
        <div className="bg-gray-800 rounded-md px-3 py-1.5 text-sm text-gray-300">
          <span className="text-gray-400 mr-1">Depth:</span>
          {selectedEquipment.depth} cm
        </div>
      </div>

      {selectedEquipment.bays.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-800 rounded-lg p-8">
          <Grid3X3 size={48} className="mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No Bays Added</h3>
          <p className="text-center max-w-md text-gray-500 mb-6">
            Add bays to this equipment to organize your shelves.
          </p>
          <button
            onClick={handleAddBay}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add First Bay
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full border-2 border-gray-800 rounded-lg p-4 overflow-x-auto space-x-6">
            {selectedEquipment.bays.map(bay => (
              <div
                key={bay.id}
                className="flex-shrink-0 bg-gray-800 border border-gray-700 hover:border-blue-400 transition rounded-lg shadow-lg w-64 flex flex-col group"
              >
                <div className="p-3 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white">{bay.name}</h3>
                      <div className="flex text-xs text-gray-400 space-x-2 mt-1">
                        <span>{bay.width}×{bay.height} cm</span>
                        <span>•</span>
                        <span>{bay.shelves.length} shelves</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBay(bay.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition"
                      title="Delete bay"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div 
                  className="flex-1 p-3 relative overflow-hidden cursor-pointer"
                  onClick={() => dispatch({ type: 'SELECT_BAY', payload: bay.id })}
                >
                  <div className="absolute inset-0 flex flex-col justify-between py-2">
                    {bay.shelves.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-gray-600">
                        <span className="text-sm">No shelves</span>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="h-1 bg-gray-700 rounded-full"></div>
                        {bay.shelves.map((shelf, index) => (
                          <div 
                            key={shelf.id}
                            className="h-6 bg-gray-700 rounded my-1 flex items-center px-2"
                          >
                            <span className="text-xs text-gray-400">{shelf.name}</span>
                          </div>
                        ))}
                        <div className="h-1 bg-gray-700 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-3 bg-gray-900 flex justify-center">
                  <span className="text-xs px-2 py-1 bg-gray-800 text-blue-400 rounded">
                    Click to view
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentView;