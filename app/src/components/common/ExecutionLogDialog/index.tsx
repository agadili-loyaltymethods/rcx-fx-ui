import React, { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  IconButton,
  InputAdornment,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { saveAs } from 'file-saver';

interface ExecutionLogDialogProps {
  open: boolean;
  onClose: () => void;
  data: {
    integrationId: string;
    runId: string;
  };
  getLogFile: (params: { integrationId: string; runId: string }) => Promise<any>;
}

const ExecutionLogDialog: React.FC<ExecutionLogDialogProps> = ({ 
  open, 
  onClose, 
  data,
  getLogFile
}) => {
  const [log, setLog] = useState<string>('');
  const [highlightedLog, setHighlightedLog] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState<number>(0);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && data) {
      getLogs();
    }
  }, [open, data]);

  const getLogs = async () => {
    if (!data?.integrationId || !data?.runId) return;
    
    try {
      const params = {
        integrationId: data.integrationId,
        runId: data.runId
      };
      
      const response = await getLogFile(params);
      
      if (response && response.body) {
        const uint8Array = new Uint8Array(response.body.data);
        const blob = new Blob([uint8Array], { type: 'text/log;charset=utf-8' });
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const content = reader.result as string || '';
          setLog(content);
          onSearchInputChange();
        };
        
        reader.readAsText(blob);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const onSearchInputChange = () => {
    const results = findSearchResults(log, searchTerm);
    setSearchResults(results);
    setCurrentResultIndex(0);
    updateHighlightedLog();
  };

  const findSearchResults = (content: string, searchTerm: string): number[] => {
    const results: number[] = [];
    
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'gi');
      let match;
      
      while ((match = regex.exec(content)) !== null) {
        results.push(match.index);
      }
    }
    
    return results;
  };

  const updateHighlightedLog = () => {
    if (searchResults.length > 0) {
      const result = searchResults[currentResultIndex];
      const match = log.substring(result, result + searchTerm.length);
      
      setHighlightedLog(highlightMatch(log, match, result));
      
      setTimeout(() => {
        scrollToResult(currentResultIndex);
      }, 100);
    } else {
      setHighlightedLog(log);
    }
  };

  const highlightMatch = (content: string, match: string, index: number): string => {
    return currentResultIndex > 0
      ? content.substring(0, index) +
        content
          .substring(index)
          .replace(
            match,
            `<span class="bg-yellow-300 font-bold result-${currentResultIndex}">${match}</span>`
          )
      : content.replace(
          match,
          `<span class="bg-yellow-300 font-bold result-${currentResultIndex}">${match}</span>`
        );
  };

  const scrollToResult = (index: number) => {
    const resultElement = document.querySelector(`.result-${index}`);
    if (resultElement && logContainerRef.current) {
      resultElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onSearchInputKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      setCurrentResultIndex((currentResultIndex + 1) % searchResults.length);
      updateHighlightedLog();
    }
  };

  const downloadFile = async () => {
    if (!data?.integrationId || !data?.runId) return;
    
    try {
      const params = {
        integrationId: data.integrationId,
        runId: data.runId
      };
      
      const response = await getLogFile(params);
      
      if (response && response.body) {
        const uint8Array = new Uint8Array(response.body.data);
        const blob = new Blob([uint8Array], { type: 'text/log;charset=utf-8' });
        
        saveAs(blob, `RCX-FX_${data.integrationId}_${data.runId}.log`);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle className="flex justify-between items-center">
        <Typography variant="h6">Execution Log</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <div className="border border-gray-200 rounded-md">
          <div className="flex items-center p-4 border-b border-gray-200">
            <TextField
              fullWidth
              placeholder="Search"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                onSearchInputChange();
              }}
              onKeyPress={onSearchInputKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchResults.length > 0 && (
                  <InputAdornment position="end">
                    <span className="text-sm text-gray-500">
                      {currentResultIndex + 1}/{searchResults.length}
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              variant="outlined"
              className="ml-2"
              onClick={getLogs}
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>
          </div>
          
          <div 
            ref={logContainerRef}
            className="bg-gray-50 p-4 h-80 overflow-auto whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedLog || log || '' }}
          />
        </div>
      </DialogContent>
      
      <DialogActions className="p-4">
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadFile}
          className="mr-2"
        >
          Download Log
        </Button>
        
        <Button
          variant="contained"
          onClick={onClose}
          className="bg-blue-800 text-white"
        >
          Ok
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecutionLogDialog;