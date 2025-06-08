import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PlanogramProvider } from './context/PlanogramContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import PlanogramView from './components/Planogram/PlanogramView';
import AddProductModal from './components/Modals/AddProductModal';
import PropertiesPanel from './components/Properties/PropertiesPanel';
import ShelfAssistant from './components/Planogram/ShelfAssistant';
import AutoGeneratePlanogram from './components/Planogram/AutoGeneratePlanogram';
import { Toaster } from 'react-hot-toast';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';

const PlanogramDesigner: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = React.useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleProperties = () => {
    setIsPropertiesOpen(!isPropertiesOpen);
  };
  
  return (
    <PlanogramProvider>
      <DndProvider backend={HTML5Backend}>
        <div className="flex flex-col h-screen bg-gray-950 text-white">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #374151',
              },
            }}
          />
          <Header toggleSidebar={toggleSidebar} />
          
          <div className="flex-1 flex overflow-hidden">
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-0'}`}>
              <Sidebar isOpen={isSidebarOpen} />
            </div>
            
            <main className="flex-1 overflow-auto bg-gray-950">
              <PlanogramView />
            </main>

            {/* Properties Toggle Button */}
            <button
              onClick={toggleProperties}
              className="absolute right-4 top-24 z-10 p-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
              title={isPropertiesOpen ? 'Hide properties' : 'Show properties'}
            >
              {isPropertiesOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isPropertiesOpen ? 'w-80' : 'w-0'}`}>
              <PropertiesPanel />
            </div>
          </div>
          
          <AddProductModal />
          <ShelfAssistant />
          <AutoGeneratePlanogram />
        </div>
      </DndProvider>
    </PlanogramProvider>
  );
};

export default PlanogramDesigner;