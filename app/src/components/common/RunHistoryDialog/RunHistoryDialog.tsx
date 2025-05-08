import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  IconButton,
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import _ from 'lodash';

interface RunHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  data: any;
  config: {
    data: {
      label: string;
      name: string;
      type?: string;
      dispCondField?: string | string[];
      dispCondValue?: any;
    }[];
  };
  onCopy: (value: string, element: any) => void;
  onDownload: (value: string, element: any) => void;
}

const RunHistoryDialog: React.FC<RunHistoryDialogProps> = ({
  open,
  onClose,
  data,
  config,
  onCopy,
  onDownload
}) => {
  const getValue = (element: any) => {
    return _.get(data, element.name);
  };

  const disCondBased = (item: any) => {
    if (item.dispCondField) {
      if (typeof item.dispCondField === 'object') {
        return (item.dispCondField as string[]).every((element) => {
          const value = _.get(data, element);
          return item.dispCondValue[element].includes(value);
        }) && (getValue(item));
      } else {
        const value = _.get(data, item.dispCondField);
        return value === item.dispCondValue;
      }
    }
    return true;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6">Integration Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <div className="mt-6 space-y-4">
          {config.data.map((element, index) => (
            <div key={index} className="flex">
              <div className="w-5/6">
                <div className="mb-1">
                  <Typography variant="subtitle2" className="text-gray-600">
                    {element.label}
                  </Typography>
                </div>
                <Tooltip title={getValue(element) || ''}>
                  <Typography className="text-gray-900 truncate">
                    {getValue(element) || ''}
                  </Typography>
                </Tooltip>
              </div>
              
              <div className="w-1/6 flex justify-end">
                {element.type === 'text' && (
                  <IconButton onClick={() => onCopy(getValue(element), element)}>
                    <ContentCopyIcon />
                  </IconButton>
                )}
                
                {element.type === 'file' && (
                  <>
                    <IconButton 
                      onClick={() => onCopy(getValue(element), element)}
                      disabled={!disCondBased(element)}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => onDownload(getValue(element), element)}
                      disabled={!disCondBased(element)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          variant="contained"
          className="bg-blue-800 text-white"
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RunHistoryDialog;