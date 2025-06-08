import React from 'react';
import { usePlanogram } from '../../context/PlanogramContext';
import DoorView from './DoorView';
import EquipmentView from './EquipmentView';
import BayView from './BayView';
import ShelfView from './ShelfView';

const PlanogramView: React.FC = () => {
  const { state } = usePlanogram();
  const { selectedDoorId, selectedEquipmentId, selectedBayId, selectedShelfId } = state;

  // Determine which view to show based on selected hierarchy
  if (selectedShelfId) {
    return <ShelfView />;
  }
  
  if (selectedBayId) {
    return <BayView />;
  }
  
  if (selectedEquipmentId) {
    return <EquipmentView />;
  }
  
  return <DoorView />;
};

export default PlanogramView;