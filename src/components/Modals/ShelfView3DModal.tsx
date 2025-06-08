import React, { useState, useRef } from 'react';
import { X, RefreshCw, FileImage } from 'lucide-react';
import ShelfView3D from '../Planogram/ShelfView3D';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface ShelfView3DModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShelfView3DModal: React.FC<ShelfView3DModalProps> = ({ isOpen, onClose }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExport = async () => {
    if (!canvasRef.current) {
      toast.error('Unable to export view');
      return;
    }

    try {
      toast.loading('Capturing 3D view...');
      
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: '#111827', // Match the background
        scale: 2 // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'planogram-3d-view.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success('3D view exported successfully');
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Export error:', error);
      toast.dismiss();
      toast.error('Failed to export 3D view');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl border border-gray-800 w-[90vw] h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">3D Layer View</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
              title="Refresh 3D view"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden" ref={canvasRef}>
          <ShelfView3D key={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default ShelfView3DModal;