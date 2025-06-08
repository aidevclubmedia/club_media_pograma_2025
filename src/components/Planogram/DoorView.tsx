import React from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Plus, Package, Info, Trash2 } from 'lucide-react';

const DoorView: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);

  if (!selectedDoor) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Info size={64} className="mb-6 text-gray-600" />
        <h2 className="text-2xl font-medium mb-2">No Door Selected</h2>
        <p className="text-center max-w-md text-gray-500 mb-6">
          Select a door from the sidebar or create a new one to get started with your planogram.
        </p>
        <button
          onClick={() => {
            const newDoor = {
              id: crypto.randomUUID(),
              name: `Door ${doors.length + 1}`,
              location: 'New Location',
              equipment: []
            };
            dispatch({ type: 'ADD_DOOR', payload: newDoor });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Create New Door
        </button>
      </div>
    );
  }

  const handleAddEquipment = () => {
    const newEquipment = {
      id: crypto.randomUUID(),
      name: `Equipment ${selectedDoor.equipment.length + 1}`,
      type: 'shelf unit',
      width: 1200,
      height: 2000,
      depth: 500,
      bays: []
    };
    
    dispatch({ 
      type: 'ADD_EQUIPMENT', 
      payload: { doorId: selectedDoorId, equipment: newEquipment }
    });
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    if (confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      dispatch({ type: 'REMOVE_EQUIPMENT', payload: equipmentId });
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">{selectedDoor.name}</h2>
          <p className="text-gray-400">Location: {selectedDoor.location}</p>
        </div>
        <button
          onClick={handleAddEquipment}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add Equipment
        </button>
      </div>

      {selectedDoor.equipment.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-800 rounded-lg p-8">
          <Package size={48} className="mb-4 text-gray-600" />
          <h3 className="text-xl font-medium mb-2">No Equipment Added</h3>
          <p className="text-center max-w-md text-gray-500 mb-6">
            Add equipment to this door to start building your planogram layout.
          </p>
          <button
            onClick={handleAddEquipment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <Plus size={18} className="mr-2" />
            Add First Equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedDoor.equipment.map(equipment => (
            <div
              key={equipment.id}
              className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-400 transition group"
            >
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{equipment.name}</h3>
                    <p className="text-sm text-gray-400">Type: {equipment.type}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEquipment(equipment.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-700 rounded transition"
                    title="Delete equipment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div 
                className="p-4 cursor-pointer"
                onClick={() => dispatch({ type: 'SELECT_EQUIPMENT', payload: equipment.id })}
              >
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-900 p-2 rounded">
                    <span className="block text-gray-400">Width</span>
                    <span className="text-white">{equipment.width} mm</span>
                  </div>
                  <div className="bg-gray-900 p-2 rounded">
                    <span className="block text-gray-400">Height</span>
                    <span className="text-white">{equipment.height} mm</span>
                  </div>
                  <div className="bg-gray-900 p-2 rounded">
                    <span className="block text-gray-400">Depth</span>
                    <span className="text-white">{equipment.depth} mm</span>
                  </div>
                  <div className="bg-gray-900 p-2 rounded">
                    <span className="block text-gray-400">Bays</span>
                    <span className="text-white">{equipment.bays.length}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 p-3 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {equipment.bays.reduce((total, bay) => total + bay.shelves.length, 0)} shelves total
                </span>
                <span className="text-xs px-2 py-1 bg-gray-800 text-blue-400 rounded">
                  Click to view
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoorView;