import React from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import { Settings, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertiesPanel: React.FC = () => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId, selectedBayId, selectedShelfId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);
  const selectedBay = selectedEquipment?.bays.find(bay => bay.id === selectedBayId);
  const selectedShelf = selectedBay?.shelves.find(shelf => shelf.id === selectedShelfId);

  const validateShelfDimensions = (updates: Partial<typeof selectedShelf>) => {
    if (!selectedBay) return true;
    
    const newWidth = updates.width ?? selectedShelf?.width ?? 0;
    const newHeight = updates.height ?? selectedShelf?.height ?? 0;
    
    if (newWidth > selectedBay.width) {
      toast.error(`Shelf width (${newWidth}cm) cannot exceed bay width (${selectedBay.width}cm)`);
      return false;
    }
    
    if (newHeight > selectedBay.height) {
      toast.error(`Shelf height (${newHeight}cm) cannot exceed bay height (${selectedBay.height}cm)`);
      return false;
    }
    
    return true;
  };

  const handleUpdateDoor = (updates: Partial<typeof selectedDoor>) => {
    if (!selectedDoor) return;
    dispatch({
      type: 'UPDATE_DOOR',
      payload: { ...selectedDoor, ...updates }
    });
  };

  const handleUpdateEquipment = (updates: Partial<typeof selectedEquipment>) => {
    if (!selectedEquipment) return;
    dispatch({
      type: 'UPDATE_EQUIPMENT',
      payload: { ...selectedEquipment, ...updates }
    });
  };

  const handleUpdateBay = (updates: Partial<typeof selectedBay>) => {
    if (!selectedBay) return;
    dispatch({
      type: 'UPDATE_BAY',
      payload: { ...selectedBay, ...updates }
    });
  };

  const handleUpdateShelf = (updates: Partial<typeof selectedShelf>) => {
    if (!selectedShelf) return;
    if (!validateShelfDimensions(updates)) return;
    
    dispatch({
      type: 'UPDATE_SHELF',
      payload: { ...selectedShelf, ...updates }
    });
  };

  const renderDoorProperties = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Door Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={selectedDoor?.name || ''}
            onChange={(e) => handleUpdateDoor({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
          <input
            type="text"
            value={selectedDoor?.location || ''}
            onChange={(e) => handleUpdateDoor({ location: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderEquipmentProperties = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Equipment Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={selectedEquipment?.name || ''}
            onChange={(e) => handleUpdateEquipment({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
          <input
            type="text"
            value={selectedEquipment?.type || ''}
            onChange={(e) => handleUpdateEquipment({ type: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Width (cm)</label>
            <input
              type="number"
              value={selectedEquipment?.width || 0}
              onChange={(e) => handleUpdateEquipment({ width: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
            <input
              type="number"
              value={selectedEquipment?.height || 0}
              onChange={(e) => handleUpdateEquipment({ height: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Depth (cm)</label>
            <input
              type="number"
              value={selectedEquipment?.depth || 0}
              onChange={(e) => handleUpdateEquipment({ depth: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBayProperties = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Bay Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={selectedBay?.name || ''}
            onChange={(e) => handleUpdateBay({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Width (cm)</label>
            <input
              type="number"
              value={selectedBay?.width || 0}
              onChange={(e) => handleUpdateBay({ width: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
            <input
              type="number"
              value={selectedBay?.height || 0}
              onChange={(e) => handleUpdateBay({ height: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Depth (cm)</label>
            <input
              type="number"
              value={selectedBay?.depth || 0}
              onChange={(e) => handleUpdateBay({ depth: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
              <Scale size={14} className="mr-1" />
              Max Weight (kg)
            </label>
            <input
              type="number"
              value={selectedBay?.maxWeight || 0}
              onChange={(e) => handleUpdateBay({ maxWeight: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderShelfProperties = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Layer Properties</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={selectedShelf?.name || ''}
            onChange={(e) => handleUpdateShelf({ name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Width (cm)</label>
            <input
              type="number"
              value={selectedShelf?.width || 0}
              onChange={(e) => handleUpdateShelf({ width: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Height (cm)</label>
            <input
              type="number"
              value={selectedShelf?.height || 0}
              onChange={(e) => handleUpdateShelf({ height: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Depth (cm)</label>
            <input
              type="number"
              value={selectedShelf?.depth || 0}
              onChange={(e) => handleUpdateShelf({ depth: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center">
              <Scale size={14} className="mr-1" />
              Max Weight (kg)
            </label>
            <input
              type="number"
              value={selectedShelf?.maxWeight || 0}
              onChange={(e) => handleUpdateShelf({ maxWeight: Number(e.target.value) })}
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNoSelection = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Settings size={48} className="mb-4 text-gray-600" />
      <p className="text-center text-sm">
        Select an item to view and edit its properties
      </p>
    </div>
  );

  return (
    <div className="p-4 border-b border-gray-800">
      <div className="flex items-center mb-4">
        <Settings className="mr-2 text-blue-400" size={20} />
        <h2 className="text-lg font-semibold text-white">Properties</h2>
      </div>
      {selectedShelfId ? renderShelfProperties() :
       selectedBayId ? renderBayProperties() :
       selectedEquipmentId ? renderEquipmentProperties() :
       selectedDoorId ? renderDoorProperties() :
       renderNoSelection()}
    </div>
  );
};

export default PropertiesPanel;