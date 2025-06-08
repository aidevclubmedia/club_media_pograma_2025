import React, { useState } from 'react';
import { Menu, Save, FileEdit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlanogram } from '../../context/PlanogramContext';
import toast from 'react-hot-toast';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state, dispatch } = usePlanogram();
  const { selectedDoorId, doors, project } = state;
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingDoor, setIsEditingDoor] = useState(false);
  const [projectInputValue, setProjectInputValue] = useState(project.name);
  const [doorInputValue, setDoorInputValue] = useState('');
  
  const currentDoor = doors.find(door => door.id === selectedDoorId);

  const handleProjectNameChange = () => {
    if (projectInputValue.trim()) {
      dispatch({
        type: 'UPDATE_PROJECT',
        payload: { name: projectInputValue }
      });
    } else {
      setProjectInputValue(project.name);
    }
    setIsEditingProject(false);
  };

  const handleDoorNameChange = () => {
    if (!currentDoor) return;
    
    if (doorInputValue.trim()) {
      dispatch({
        type: 'UPDATE_DOOR',
        payload: { ...currentDoor, name: doorInputValue }
      });
    } else {
      setDoorInputValue(currentDoor.name);
    }
    setIsEditingDoor(false);
  };

  const startEditingProject = () => {
    setProjectInputValue(project.name);
    setIsEditingProject(true);
  };

  const startEditingDoor = () => {
    if (!currentDoor) return;
    setDoorInputValue(currentDoor.name);
    setIsEditingDoor(true);
  };

  const handleSave = () => {
    toast.success('Layout saved successfully');
  };

  return (
    <header className="bg-gray-900 text-white h-20 flex justify-between items-center px-6 shadow-md z-10 border-b border-gray-800">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-gray-800 transition duration-150 ease-in-out"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center">
          <img 
            src="https://mymrdouzyuqlimxtysun.supabase.co/storage/v1/object/sign/images/Pograma_Header_Logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMTI2MTc1ZS1mYzE4LTQ3MjctYjk2Yi1jZDdjMjliNWI2OWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvUG9ncmFtYV9IZWFkZXJfTG9nby5wbmciLCJpYXQiOjE3NDk0MDc1MzcsImV4cCI6MzMyNjIwNzUzN30.rg72WnN2erKHH8sAMn8goTOARLSPa-hZu9EUUjjTU2k"
            alt="POGrama"
            className="h-10 w-auto object-contain"
          />
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Project Name */}
        <div className="flex items-center bg-gray-800 px-4 py-2 rounded-md">
          {isEditingProject ? (
            <input
              type="text"
              value={projectInputValue}
              onChange={(e) => setProjectInputValue(e.target.value)}
              onBlur={handleProjectNameChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleProjectNameChange();
                } else if (e.key === 'Escape') {
                  setProjectInputValue(project.name);
                  setIsEditingProject(false);
                }
              }}
              className="bg-transparent border-none focus:outline-none text-white w-48"
              autoFocus
            />
          ) : (
            <>
              <span className="text-gray-400 mr-2">Project:</span>
              <span className="font-medium">{project.name}</span>
              <button
                onClick={startEditingProject}
                className="ml-2 p-1 hover:bg-gray-700 rounded transition"
              >
                <FileEdit size={14} className="text-gray-400" />
              </button>
            </>
          )}
        </div>

        {/* Door Name */}
        {currentDoor && (
          <div className="flex items-center bg-gray-800 px-4 py-2 rounded-md">
            {isEditingDoor ? (
              <input
                type="text"
                value={doorInputValue}
                onChange={(e) => setDoorInputValue(e.target.value)}
                onBlur={handleDoorNameChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleDoorNameChange();
                  } else if (e.key === 'Escape') {
                    setDoorInputValue(currentDoor.name);
                    setIsEditingDoor(false);
                  }
                }}
                className="bg-transparent border-none focus:outline-none text-white w-48"
                autoFocus
              />
            ) : (
              <>
                <span className="text-gray-400 mr-2">Door:</span>
                <span className="font-medium">{currentDoor.name}</span>
                <button
                  onClick={startEditingDoor}
                  className="ml-2 p-1 hover:bg-gray-700 rounded transition"
                >
                  <FileEdit size={14} className="text-gray-400" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <button 
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition duration-150 ease-in-out text-sm font-medium flex items-center"
        >
          <Save size={16} className="mr-2" />
          Save Layout
        </button>
      </div>
    </header>
  );
};

export default Header;