import React, { useState } from 'react';
import { IconButton, Typography } from '@mui/material';

interface ErrorSidePanelProps {
  drawer: any;
  errors: string[];
}

const ErrorSidePanel: React.FC<ErrorSidePanelProps> = ({ drawer, errors = [] }) => {
  const [showFiller, setShowFiller] = useState(true);

  return (
    <div className="h-full overflow-auto">
      {!showFiller ? (
        <div className="p-10">
          <div className="flex flex-col items-center">
            <div className="bg-red-50 border border-red-300 rounded-md p-4 text-center mb-10">
              <div className="text-3xl font-bold text-red-700">{errors.length}</div>
              <div className="text-red-700">Errors</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10">
          <div className="bg-white rounded-md shadow-sm">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="text-xl font-semibold">Errors and Warnings</div>
              <IconButton onClick={() => drawer.toggle()}>
                <span className="material-icons">close</span>
              </IconButton>
            </div>
            
            <div className="p-4 max-h-[calc(100vh-200px)] overflow-auto">
              <div className="inline-flex items-center bg-red-50 border border-red-300 rounded-md px-3 py-1 mb-6">
                <span className="font-semibold text-red-700 mr-1">{errors.length}</span> Errors
              </div>
              
              {errors.map((error, index) => (
                <div key={index} className="mb-6 pb-6 border-b border-gray-200">
                  <Typography className="text-gray-800 text-sm">{error}</Typography>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className={`absolute bottom-0 right-0 p-5 ${showFiller ? 'w-full' : ''}`}>
        <button 
          onClick={() => setShowFiller(!showFiller)} 
          className="bg-white rounded-full p-2 shadow-md"
        >
          <span className="material-icons">
            {showFiller ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ErrorSidePanel;