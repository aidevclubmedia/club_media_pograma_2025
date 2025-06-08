import React from 'react';
import { ShoppingBag, Package, Grid3X3, LayoutList, Layers, Plus } from 'lucide-react';
import { usePlanogram } from '../../context/PlanogramContext';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { state, dispatch } = usePlanogram();
  const { doors, selectedDoorId, selectedEquipmentId, selectedBayId, selectedShelfId } = state;

  const selectedDoor = doors.find(door => door.id === selectedDoorId);
  const selectedEquipment = selectedDoor?.equipment.find(eq => eq.id === selectedEquipmentId);
  const selectedBay = selectedEquipment?.bays.find(bay => bay.id === selectedBayId);

  const handleAddDoor = () => {
    const newDoor = {
      id: crypto.randomUUID(),
      name: `Door ${doors.length + 1}`,
      location: 'New Location',
      equipment: []
    };
    dispatch({ type: 'ADD_DOOR', payload: newDoor });
  };

  const handleAddEquipment = () => {
    if (!selectedDoorId) return;
    
    const newEquipment = {
      id: crypto.randomUUID(),
      name: `Equipment ${selectedDoor?.equipment.length ? selectedDoor.equipment.length + 1 : 1}`,
      type: 'shelf unit',
      width: 120,
      height: 200,
      depth: 50,
      bays: []
    };
    
    dispatch({ 
      type: 'ADD_EQUIPMENT', 
      payload: { doorId: selectedDoorId, equipment: newEquipment }
    });
  };

  const handleAddBay = () => {
    if (!selectedEquipmentId) return;
    
    const newBay = {
      id: crypto.randomUUID(),
      name: `Bay ${selectedEquipment?.bays.length ? selectedEquipment.bays.length + 1 : 1}`,
      width: 200,
      height: 100,
      depth: 60,
      maxWeight: 100,
      shelves: []
    };
    
    dispatch({
      type: 'ADD_BAY',
      payload: { equipmentId: selectedEquipmentId, bay: newBay }
    });
  };

  const handleAddShelf = () => {
    if (!selectedBayId) return;
    
    const newShelf = {
      id: crypto.randomUUID(),
      name: `Shelf ${selectedBay?.shelves.length ? selectedBay.shelves.length + 1 : 1}`,
      width: 200,
      height: 40,
      depth: 50,
      maxWeight: 50,
      products: []
    };
    
    dispatch({
      type: 'ADD_SHELF',
      payload: { bayId: selectedBayId, shelf: newShelf }
    });
  };

  const handleSelectDoor = (doorId: string) => {
    dispatch({ type: 'SELECT_DOOR', payload: doorId });
  };

  const handleSelectEquipment = (equipmentId: string) => {
    dispatch({ type: 'SELECT_EQUIPMENT', payload: equipmentId });
  };

  const handleSelectBay = (bayId: string) => {
    dispatch({ type: 'SELECT_BAY', payload: bayId });
  };

  const handleSelectShelf = (shelfId: string) => {
    dispatch({ type: 'SELECT_SHELF', payload: shelfId });
  };

  return (
    <aside 
      className={`bg-gray-900 text-white h-full flex flex-col border-r border-gray-800 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}
    >
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold flex items-center">
          <Layers className="mr-2 text-blue-400" size={20} />
          Planogram Hierarchy
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Doors</h3>
            <button 
              onClick={handleAddDoor}
              className="p-1 rounded-md hover:bg-gray-800 transition"
              title="Add Door"
            >
              <Plus size={16} className="text-blue-400" />
            </button>
          </div>
          <ul className="space-y-1">
            {doors.map(door => (
              <li key={door.id}>
                <button
                  onClick={() => handleSelectDoor(door.id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                    selectedDoorId === door.id ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'
                  }`}
                >
                  <ShoppingBag className="mr-2" size={16} />
                  <span className="truncate">{door.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {selectedDoor && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Equipment</h3>
              <button 
                onClick={handleAddEquipment}
                className="p-1 rounded-md hover:bg-gray-800 transition"
                title="Add Equipment"
              >
                <Plus size={16} className="text-blue-400" />
              </button>
            </div>
            <ul className="space-y-1 pl-2 border-l border-gray-800">
              {selectedDoor.equipment.map(equipment => (
                <li key={equipment.id}>
                  <button
                    onClick={() => handleSelectEquipment(equipment.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      selectedEquipmentId === equipment.id ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'
                    }`}
                  >
                    <Package className="mr-2" size={16} />
                    <span className="truncate">{equipment.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedEquipment && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Bays</h3>
              <button 
                onClick={handleAddBay}
                className="p-1 rounded-md hover:bg-gray-800 transition"
                title="Add Bay"
              >
                <Plus size={16} className="text-blue-400" />
              </button>
            </div>
            <ul className="space-y-1 pl-4 border-l border-gray-800">
              {selectedEquipment.bays.map(bay => (
                <li key={bay.id}>
                  <button
                    onClick={() => handleSelectBay(bay.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      selectedBayId === bay.id ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'
                    }`}
                  >
                    <Grid3X3 className="mr-2" size={16} />
                    <span className="truncate">{bay.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedBay && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Layers</h3>
              <button 
                onClick={handleAddShelf}
                className="p-1 rounded-md hover:bg-gray-800 transition"
                title="Add Layer"
              >
                <Plus size={16} className="text-blue-400" />
              </button>
            </div>
            <ul className="space-y-1 pl-6 border-l border-gray-800">
              {selectedBay.shelves.map(shelf => (
                <li key={shelf.id}>
                  <button
                    onClick={() => handleSelectShelf(shelf.id)}
                    className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                      selectedShelfId === shelf.id ? 'bg-gray-800 text-blue-400' : 'hover:bg-gray-800'
                    }`}
                  >
                    <LayoutList className="mr-2" size={16} />
                    <span className="truncate">{shelf.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;