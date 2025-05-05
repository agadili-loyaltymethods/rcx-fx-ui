import React from 'react';
import { 
  Typography, 
  IconButton, 
  Button,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';
import { DeleteButton } from '../../components/common';

const ConnectionDetail: React.FC = () => {
  // In a real implementation, this data would come from props or a data fetching hook
  const data = {
    name: 'Connection 123',
    partner: { name: 'Hertz' },
    connectionType: 'AWS S3',
    url: 's3://abc.com',
    accessKeyId: 'ASIA25ZZONFD2DMRGH5Z',
    secretAccessKey: 'twTeMQsc6EXSw/qM9wafUTRM7bJDpusLCYtH8G3H',
    region: 'Example Region here',
    encryptionAlgorithm: 'Algorithm123',
    encryptionKey: 'file123',
    compressionAlgorithm: 'Algorithm123',
    compressionLevel: '3'
  };

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              component={Link} 
              to="/connections/list"
              className="border border-gray-200 rounded-full"
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">
              Connections / <span className="text-gray-500">View Connection</span>
            </Typography>
            <Typography variant="h6" className="font-semibold">
              Connection Details
            </Typography>
          </div>
        </div>
        
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to="/connections/create"
          className="bg-blue-800 hover:bg-blue-900"
        >
          Edit
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <div className="border border-gray-200 rounded-t-lg">
          <div className="flex items-center px-5 py-6 border-b border-gray-200">
            <Typography variant="h6" className="font-semibold">
              Connection Details
            </Typography>
          </div>
          
          <Card className="rounded-none shadow-none">
            <CardContent>
              <Grid container spacing={3}>
                {/* Row 1 */}
                <Grid item xs={4}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Connection Name *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.name}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={4}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Partner *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.partner.name}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={4}></Grid>
                
                {/* Row 2 */}
                <Grid item xs={8}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Description *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      This is an example description that is exceptionally long and keeps going no matter what you keep typing
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={4}></Grid>
                
                {/* Row 3 */}
                <Grid item xs={4}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Connection Type *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.connectionType}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={8}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      URL *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.url}
                    </Typography>
                  </div>
                </Grid>
                
                {/* Row 4 */}
                <Grid item xs={4}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Access Key ID *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.accessKeyId}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={8}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Secret Access Key *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.secretAccessKey}
                    </Typography>
                  </div>
                </Grid>
                
                {/* Row 5 */}
                <Grid item xs={4}>
                  <div className="px-5 pt-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Region *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.region}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={8}></Grid>
                
                {/* Encryption Section */}
                <Grid item xs={12}>
                  <div className="px-5 pt-8 border-t border-gray-200 mt-4">
                    <div className="flex items-center mb-4">
                      <span className="material-icons mr-1">lock</span>
                      <Typography variant="h6" className="font-semibold">
                        Encryption
                      </Typography>
                    </div>
                  </div>
                </Grid>
                
                <Grid item xs={4}>
                  <div className="px-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Encryption Algorithm *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.encryptionAlgorithm}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={8}>
                  <div className="px-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Encryption Key *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.encryptionKey}
                    </Typography>
                  </div>
                </Grid>
                
                {/* Compression Section */}
                <Grid item xs={12}>
                  <div className="px-5 pt-8 border-t border-gray-200 mt-4">
                    <div className="flex items-center mb-4">
                      <span className="material-icons mr-1">compress</span>
                      <Typography variant="h6" className="font-semibold">
                        Compression
                      </Typography>
                    </div>
                  </div>
                </Grid>
                
                <Grid item xs={4}>
                  <div className="px-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Compression Algorithm *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.compressionAlgorithm}
                    </Typography>
                  </div>
                </Grid>
                <Grid item xs={8}>
                  <div className="px-5 pb-5">
                    <Typography variant="subtitle2" className="text-gray-600 mb-1">
                      Compression Level *
                    </Typography>
                    <Typography variant="body1" className="font-medium text-gray-900">
                      {data.compressionLevel}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </div>
        
        {/* Delete Button */}
        <div className="mt-4">
          <DeleteButton>Delete Connection</DeleteButton>
        </div>
      </div>
    </div>
  );
};

export default ConnectionDetail;