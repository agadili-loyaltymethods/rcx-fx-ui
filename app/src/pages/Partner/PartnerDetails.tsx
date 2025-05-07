import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const PartnerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>({});
  
  useEffect(() => {
    // In a real implementation, this would fetch the partner data from an API
    // For now, we'll just set some dummy data
    setData({
      name: 'Partner Name',
      partnerType: 'Supplier',
      code: 'P123',
      email: 'support@partner.com',
      phone: '+1 (123) 456-7890',
      timezone: 'UTC',
      isHostingPartner: true,
      updatedBy: {
        login: 'admin'
      },
      updatedAt: new Date().toISOString()
    });
  }, [id]);

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-7 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="mr-4">
            <IconButton 
              component={Link} 
              to="/partners"
              className="border border-gray-200 rounded-full"
            >
              <ArrowBackIcon />
            </IconButton>
          </div>
          <div>
            <Typography variant="body2" className="text-gray-700">
              Partners / <span className="text-gray-500">Details</span>
            </Typography>
            <Typography variant="h6" className="font-semibold">
              {data.name}
            </Typography>
          </div>
        </div>
        
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          component={Link}
          to="/partners/create"
          className="bg-blue-800 hover:bg-blue-900"
        >
          Edit
        </Button>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        <Card className="border border-gray-200 rounded-t-lg">
          <div className="flex items-center px-5 py-6 border-b border-gray-200">
            <Typography variant="h6" className="font-semibold">
              Partner Details
            </Typography>
            <div className="ml-4 px-3 py-1 text-xs font-medium rounded border border-amber-500 text-amber-800">
              Revision
            </div>
          </div>
          
          <CardContent>
            <Grid container spacing={3}>
              {/* Row 1 */}
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Partner Name
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.name}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Partner Type
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.partnerType}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Code
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.code}
                  </Typography>
                </div>
              </Grid>
              
              {/* Row 2 */}
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Support Number
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.phone}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Support Email
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.email}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className="px-5 pt-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Timezone
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.timezone}
                  </Typography>
                </div>
              </Grid>
              
              {/* Row 3 */}
              <Grid item xs={4}>
                <div className="px-5 pt-5 pb-5">
                  <Typography variant="subtitle2" className="text-gray-600 mb-1">
                    Hosting Partner
                  </Typography>
                  <Typography variant="body1" className="font-medium text-gray-900">
                    {data.isHostingPartner ? 'Yes' : 'No'}
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Delete Button */}
        <div className="mt-4">
          <DeleteButton>Delete Partner</DeleteButton>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetails;