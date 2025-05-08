import React from 'react';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteButtonProps {
  disableButton?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  disableButton = false, 
  children, 
  onClick 
}) => {
  return (
    <Button 
      disabled={disableButton} 
      className="border border-red-700 text-red-700 bg-red-50 hover:bg-red-100 rounded px-3 py-2 flex items-center gap-2"
      onClick={onClick}
    >
      <DeleteIcon className="text-red-700" fontSize="small" />
      <span className="font-semibold text-sm">{children}</span>
    </Button>
  );
};

export default DeleteButton;