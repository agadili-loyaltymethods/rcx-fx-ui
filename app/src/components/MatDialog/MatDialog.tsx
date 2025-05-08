// Dialog.tsx
import React from 'react';
import './Dialog.css';

interface DialogProps {
  isOpen: boolean;
  schema?: string;
  content: string;
  confirmButton?: string;
  cancelButton?: string;
  disableCancelButton?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const MatDialog: React.FC<DialogProps> = ({
  isOpen,
  schema,
  content,
  confirmButton,
  cancelButton,
  disableCancelButton,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleClose = () => {
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2>{schema}</h2>
        </div>
        <div className="dialog-body">
          <p dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div className="dialog-footer">
          {!disableCancelButton && (
            <button className="cancel-button" onClick={handleClose}>
              {cancelButton}
            </button>
          )}
          <button className="confirm-button" onClick={handleConfirm}>
            {confirmButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatDialog;