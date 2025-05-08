import React, { useState, useEffect } from 'react';
import { DynamicTable } from '@/components/common';

interface IntegrationListProps {
  config: any;
  data: any[];
  handler: any;
  parentData?: any;
}

const IntegrationList: React.FC<IntegrationListProps> = ({ 
  config, 
  data, 
  handler,
  parentData
}) => {
  const [tableConfig, setTableConfig] = useState<any>(null);

  useEffect(() => {
    if (config) {
      setTableConfig(config);
    }
  }, [config]);

  return (
    <div className="responsive-table">
      {tableConfig && (
        <DynamicTable
          config={tableConfig}
          data={data}
          handlers={handler}
        />
      )}
    </div>
  );
};

export default IntegrationList;