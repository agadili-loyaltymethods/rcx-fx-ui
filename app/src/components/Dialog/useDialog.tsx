// useDialog.ts
import { useState } from 'react';
import MatDialog from '@/components/MatDialog/MatDialog';

interface DialogConfig {
  schema?: string;
  content: string;
  confirmButton?: string;
  cancelButton?: string;
  disableCancelButton?: boolean;
  onConfirm?: () => void;
  onClose?: () => void;
}

const useDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig | null>(null);

  const open = (config: DialogConfig) => {
    setConfig(config);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setConfig(null);
  };

  return {
    open,
    close,
    isOpen,
    config,
  };
};

const DialogProvider = () => {
  const { isOpen, config, close } = useDialog();

  if (!isOpen && !config) return null;
  if(config){
    return <MatDialog isOpen={isOpen} onClose={close} {...config} />;
  }
  else {
    return '';
  }
};

export { useDialog, DialogProvider };