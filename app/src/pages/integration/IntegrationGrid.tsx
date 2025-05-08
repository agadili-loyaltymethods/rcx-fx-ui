import React, { useState, useEffect } from 'react';
import { DynamicGrid } from '@/components/common';

interface IntegrationGridProps {
  data: any[];
  handler: any;
}

const IntegrationGrid: React.FC<IntegrationGridProps> = ({ data, handler }) => {
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, this would fetch from a config service
    const fetchConfig = async () => {
      // Simulating config fetch
      setConfig({
        data: [
          {
            section: 'section1',
            fields: [
              { name: 'name', label: 'Integration Name', className: 'template-name' }
            ]
          },
          {
            section: 'section2',
            singleRow: true,
            fields: [
              { name: 'partner.name', label: 'Partner' },
              { name: 'template.name', label: 'Template' },
              { name: 'template.rcxProcess', label: 'RCX Process' }
            ]
          },
          {
            section: 'section3',
            fields: [
              { 
                name: 'description', 
                label: 'Description', 
                displayType: 'noLabel',
                default: 'No description available'
              }
            ]
          },
          {
            section: 'section4',
            fields: [
              { 
                name: 'updatedBy.login', 
                label: 'Updated By', 
                displayType: 'updateInfo',
                time: 'updatedAt'
              }
            ]
          }
        ],
        actions: [
          { name: 'Edit', iconname: 'edit', clickHandler: 'editIntegration' },
          { name: 'Copy', iconname: 'content_copy', clickHandler: 'copyIntegration' },
          { name: 'Run Once', iconname: 'play_arrow', clickHandler: 'runOnceIntegration' },
          { name: 'Publish', iconname: 'publish', clickHandler: 'publishIntegration' },
          { name: 'Unpublish', iconname: 'unpublished', clickHandler: 'unpublishIntegration' },
          { name: 'Pause', iconname: 'pause', clickHandler: 'pauseIntegration' },
          { name: 'Resume', iconname: 'play_arrow', clickHandler: 'resumeIntegration' },
          { name: 'Delete', iconname: 'delete', clickHandler: 'deleteIntegration' }
        ],
        paginationOptions: {
          pageSize: 9,
          pageSizeOptions: [9, 18, 27]
        },
        commonProperties: {
          ellipsisMaxLength: 30,
          gridViewEllipses: 30
        }
      });
    };
    
    fetchConfig();
  }, []);

  return (
    <div className="responsive-table">
      {config && (
        <DynamicGrid
          config={config}
          data={data}
          handler={handler}
        />
      )}
    </div>
  );
};

export default IntegrationGrid;