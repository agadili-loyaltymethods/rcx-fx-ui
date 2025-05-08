import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  IconButton,
  Checkbox,
  FormControlLabel,
  TextField,
  List,
  ListItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DialogData {
  schema?: string;
  content?: string;
  confirmButton?: string;
  cancelButton?: string;
  disableCancelButton?: boolean;
  getInput?: boolean;
  inputType?: 'text' | 'file' | 'switch';
  header?: string;
  placeHolder?: string;
  dialogType?: string;
  slideToggle?: boolean;
  slideToggleContent?: string;
  data?: any;
  listView?: boolean;
  arrayList?: string[];
  formView?: boolean;
}

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  data: DialogData;
  onConfirm?: (data?: any, inputData?: any, isToggleActive?: boolean) => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  open, 
  onClose, 
  data, 
  onConfirm 
}) => {
  const [inputData, setInputData] = useState<string | File | null>(null);
  const [isToggleActive, setIsToggleActive] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(data.data, inputData, isToggleActive);
    }
    onClose();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setInputData(event.target.files[0]);
      setFileSelected(true);
    }
  };

  const getButtonClass = () => {
    const types = ['testFile'];
    
    if (!inputData && types.includes(data.dialogType || '')) {
      return "bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed";
    }
    
    return "bg-blue-800 text-white";
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      className="rounded-lg shadow-md"
    >
      <div className="p-6">
        <DialogTitle className="flex justify-between items-center p-0 mb-4">
          <Typography variant="h6" className="font-semibold">{data.schema}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-0 mb-6">
          {!data.getInput ? (
            <>
              {data.content && (
                <div 
                  className="text-gray-700 text-sm"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              )}
              
              {data.listView && data.arrayList && (
                <List className="mt-4">
                  {data.arrayList.map((item, index) => (
                    <ListItem key={index} className="pl-4">
                      {item !== '...' && <span className="mr-2">•</span>}
                      {item}
                    </ListItem>
                  ))}
                </List>
              )}
              
              {data.formView && data.data && (
                <div className="mt-4">
                  {data.data.map((row: any, rowIndex: number) => (
                    <div key={rowIndex} className="flex mb-4">
                      {row.map((field: any, fieldIndex: number) => (
                        <div key={fieldIndex} className={`${fieldIndex === 0 ? 'w-1/3' : 'w-2/3'} pr-4`}>
                          <Typography className="font-semibold text-sm">{field.field}</Typography>
                          <Typography 
                            className="text-sm" 
                            style={field.css ? { ...JSON.parse(field.css.replace(/'/g, '"')) } : {}}
                          >
                            {field.value}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              {data.inputType === 'text' && (
                <TextField
                  fullWidth
                  label="Name"
                  variant="outlined"
                  value={inputData as string || ''}
                  onChange={(e) => setInputData(e.target.value)}
                />
              )}
              
              {data.inputType === 'file' && (
                <div>
                  <div className="relative">
                    <TextField
                      fullWidth
                      placeholder={data.placeHolder || "Upload File"}
                      variant="outlined"
                      value={(inputData as File)?.name || ''}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <IconButton 
                            onClick={() => document.getElementById('file-input')?.click()} 
                            edge="end"
                          >
                            <span className="material-icons">upload</span>
                          </IconButton>
                        ),
                      }}
                      onClick={() => document.getElementById('file-input')?.click()}
                    />
                    <input
                      id="file-input"
                      type="file"
                      hidden
                      onChange={handleFileChange}
                    />
                  </div>
                  
                  {data.slideToggle && fileSelected && (
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={isToggleActive}
                          onChange={(e) => setIsToggleActive(e.target.checked)}
                          color="primary"
                        />
                      }
                      label={data.slideToggleContent || ''}
                      className="mt-4"
                    />
                  )}
                </div>
              )}
              
              {data.inputType === 'switch' && (
                <div>
                  {data.textBlock && (
                    <div 
                      className="mb-4 text-gray-700"
                      dangerouslySetInnerHTML={{ __html: data.textBlock }}
                    />
                  )}
                  
                  {data.content && data.content.map((option: any, index: number) => (
                    <FormControlLabel
                      key={index}
                      control={
                        <Checkbox 
                          checked={data.data?.hardDelete === option.value}
                          onChange={() => data.data.hardDelete = option.value}
                          color="primary"
                        />
                      }
                      label={option.key}
                      className="ml-2 block"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>

        <DialogActions className="p-0 flex justify-end">
          {!data.disableCancelButton && (
            <Button 
              onClick={onClose}
              className="border border-gray-300 text-gray-700 mr-3 px-4 py-2 rounded"
            >
              {data.cancelButton || 'Cancel'}
            </Button>
          )}
          
          <Button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded ${getButtonClass()}`}
            disabled={data.dialogType === 'testFile' && !inputData}
          >
            {data.confirmButton || 'Confirm'}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default ConfirmationDialog;