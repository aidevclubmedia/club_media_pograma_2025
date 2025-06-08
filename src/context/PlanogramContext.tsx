import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PlanogramState, Door, Equipment, Bay, Shelf, Product, PlacedProduct, Project } from '../types';
import { sampleProducts, sampleDoor } from '../data/sampleData';

// Initial state
const initialState: PlanogramState = {
  project: {
    id: crypto.randomUUID(),
    name: 'New Project',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  doors: [sampleDoor],
  selectedDoorId: 'door1',
  selectedEquipmentId: null,
  selectedBayId: null,
  selectedShelfId: null,
  productCatalog: sampleProducts,
  isAddProductModalOpen: false,
  visualizationMode: 'standard'
};

// Actions
type PlanogramAction = 
  | { type: 'UPDATE_PROJECT'; payload: Partial<Project> }
  | { type: 'ADD_DOOR'; payload: Door }
  | { type: 'ADD_EQUIPMENT'; payload: { doorId: string; equipment: Equipment } }
  | { type: 'ADD_BAY'; payload: { equipmentId: string; bay: Bay } }
  | { type: 'ADD_SHELF'; payload: { bayId: string; shelf: Shelf } }
  | { type: 'ADD_PRODUCT_TO_SHELF'; payload: { shelfId: string; product: PlacedProduct } }
  | { type: 'SELECT_DOOR'; payload: string }
  | { type: 'SELECT_EQUIPMENT'; payload: string }
  | { type: 'SELECT_BAY'; payload: string }
  | { type: 'SELECT_SHELF'; payload: string }
  | { type: 'TOGGLE_ADD_PRODUCT_MODAL'; payload: boolean }
  | { type: 'UPDATE_DOOR'; payload: Door }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_BAY'; payload: Bay }
  | { type: 'UPDATE_SHELF'; payload: Shelf }
  | { type: 'REMOVE_DOOR'; payload: string }
  | { type: 'REMOVE_EQUIPMENT'; payload: string }
  | { type: 'REMOVE_BAY'; payload: string }
  | { type: 'REMOVE_SHELF'; payload: string }
  | { type: 'REMOVE_PRODUCT_FROM_SHELF'; payload: { shelfId: string; productId: string } };

// Reducer
const planogramReducer = (state: PlanogramState, action: PlanogramAction): PlanogramState => {
  switch (action.type) {
    case 'UPDATE_PROJECT':
      return {
        ...state,
        project: {
          ...state.project,
          ...action.payload,
          updatedAt: new Date()
        }
      };
      
    case 'ADD_DOOR':
      return {
        ...state,
        doors: [...state.doors, action.payload],
        selectedDoorId: action.payload.id
      };
    
    case 'ADD_EQUIPMENT':
      return {
        ...state,
        doors: state.doors.map(door => 
          door.id === action.payload.doorId
            ? { ...door, equipment: [...door.equipment, action.payload.equipment] }
            : door
        ),
        selectedEquipmentId: action.payload.equipment.id
      };
    
    case 'ADD_BAY':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => 
            equip.id === action.payload.equipmentId
              ? { ...equip, bays: [...equip.bays, action.payload.bay] }
              : equip
          )
        })),
        selectedBayId: action.payload.bay.id
      };
    
    case 'ADD_SHELF':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => 
              bay.id === action.payload.bayId
                ? { ...bay, shelves: [...bay.shelves, action.payload.shelf] }
                : bay
            )
          }))
        })),
        selectedShelfId: action.payload.shelf.id
      };
    
    case 'ADD_PRODUCT_TO_SHELF':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => ({
              ...bay,
              shelves: bay.shelves.map(shelf => 
                shelf.id === action.payload.shelfId
                  ? { 
                      ...shelf, 
                      products: [...shelf.products, action.payload.product] 
                    }
                  : shelf
              )
            }))
          }))
        }))
      };
    
    case 'SELECT_DOOR':
      return {
        ...state,
        selectedDoorId: action.payload,
        selectedEquipmentId: null,
        selectedBayId: null,
        selectedShelfId: null
      };
    
    case 'SELECT_EQUIPMENT':
      return {
        ...state,
        selectedEquipmentId: action.payload,
        selectedBayId: null,
        selectedShelfId: null
      };
    
    case 'SELECT_BAY':
      return {
        ...state,
        selectedBayId: action.payload,
        selectedShelfId: null
      };
    
    case 'SELECT_SHELF':
      return {
        ...state,
        selectedShelfId: action.payload
      };
    
    case 'TOGGLE_ADD_PRODUCT_MODAL':
      return {
        ...state,
        isAddProductModalOpen: action.payload
      };
    
    case 'UPDATE_DOOR':
      return {
        ...state,
        doors: state.doors.map(door => 
          door.id === action.payload.id ? action.payload : door
        )
      };
    
    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => 
            equip.id === action.payload.id ? action.payload : equip
          )
        }))
      };
    
    case 'UPDATE_BAY':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => 
              bay.id === action.payload.id ? action.payload : bay
            )
          }))
        }))
      };
    
    case 'UPDATE_SHELF':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => ({
              ...bay,
              shelves: bay.shelves.map(shelf => 
                shelf.id === action.payload.id ? action.payload : shelf
              )
            }))
          }))
        }))
      };
    
    case 'REMOVE_DOOR':
      return {
        ...state,
        doors: state.doors.filter(door => door.id !== action.payload),
        selectedDoorId: state.doors.length > 1 
          ? (state.selectedDoorId === action.payload 
            ? state.doors.find(d => d.id !== action.payload)?.id || null 
            : state.selectedDoorId) 
          : null,
        selectedEquipmentId: state.selectedDoorId === action.payload ? null : state.selectedEquipmentId,
        selectedBayId: state.selectedDoorId === action.payload ? null : state.selectedBayId,
        selectedShelfId: state.selectedDoorId === action.payload ? null : state.selectedShelfId
      };
    
    case 'REMOVE_EQUIPMENT':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.filter(equip => equip.id !== action.payload)
        })),
        selectedEquipmentId: state.selectedEquipmentId === action.payload ? null : state.selectedEquipmentId,
        selectedBayId: state.selectedEquipmentId === action.payload ? null : state.selectedBayId,
        selectedShelfId: state.selectedEquipmentId === action.payload ? null : state.selectedShelfId
      };
    
    case 'REMOVE_BAY':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.filter(bay => bay.id !== action.payload)
          }))
        })),
        selectedBayId: state.selectedBayId === action.payload ? null : state.selectedBayId,
        selectedShelfId: state.selectedBayId === action.payload ? null : state.selectedShelfId
      };
    
    case 'REMOVE_SHELF':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => ({
              ...bay,
              shelves: bay.shelves.filter(shelf => shelf.id !== action.payload)
            }))
          }))
        })),
        selectedShelfId: state.selectedShelfId === action.payload ? null : state.selectedShelfId
      };
    
    case 'REMOVE_PRODUCT_FROM_SHELF':
      return {
        ...state,
        doors: state.doors.map(door => ({
          ...door,
          equipment: door.equipment.map(equip => ({
            ...equip,
            bays: equip.bays.map(bay => ({
              ...bay,
              shelves: bay.shelves.map(shelf => 
                shelf.id === action.payload.shelfId
                  ? { 
                      ...shelf, 
                      products: shelf.products.filter(
                        product => product.productId !== action.payload.productId
                      ) 
                    }
                  : shelf
              )
            }))
          }))
        }))
      };
    
    default:
      return state;
  }
};

// Context
const PlanogramContext = createContext<{
  state: PlanogramState;
  dispatch: React.Dispatch<PlanogramAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Provider Component
export const PlanogramProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(planogramReducer, initialState);

  return (
    <PlanogramContext.Provider value={{ state, dispatch }}>
      {children}
    </PlanogramContext.Provider>
  );
};

// Custom hook to use the context
export const usePlanogram = () => useContext(PlanogramContext);

// Helper functions for generating unique IDs
export const generateId = () => crypto.randomUUID();