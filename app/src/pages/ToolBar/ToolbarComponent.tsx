// ToolbarComponent.tsx
import React from 'react';

interface ToolbarProps {
  // Add any props you want to pass to the toolbar
  title: string;
}

const ToolbarComponent: React.FC<ToolbarProps> = ({ title }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#3f51b5', // primary color
      color: 'white'
    }}>
      <span>{title}</span>
    </div>
  );
};

export default ToolbarComponent;