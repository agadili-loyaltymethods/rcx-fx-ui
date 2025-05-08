// TemplateGridComponent.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUiConfig } from '@/services/ui-config/useUiConfig';
import DynamicGrid from './DynamicGrid';
import './TemplateGridComponent.css';

interface TemplateGridComponentProps {
  data: any;
  handler: any;
}

const TemplateGridComponent: React.FC<TemplateGridComponentProps> = ({
  data,
  handler,
}) => {
  const { uiConfig, isLoading } = useUiConfig();
  const { register, handleSubmit } = useForm();
  const [config, setConfig] = useState({});

  useEffect(() => {
    const getConfig = async () => {
      const gridViewConfig = await uiConfig.getGridViewConfig('templates');
      setConfig(gridViewConfig || {});
    };
    getConfig();
  }, [uiConfig]);

  const getValue = (value: any) => {
    // implement dateTimeFormat pipe equivalent
    return new Date(value).toLocaleString();
  };

  const copy = (row: any) => {
    handler.copy(row);
  };

  const edit = (row: any) => {
    handler.edit(row);
  };

  const deleteRow = (row: any) => {
    handler.delete(row);
  };

  const openPopup = () => {
    // implement popup dialog equivalent
  };

  if (!config) return null;

  return (
    <div>
      <DynamicGrid
        config={config}
        data={data}
        handler={{
          copy,
          edit,
          delete: deleteRow,
          openPopup,
        }}
      />
    </div>
  );
};

export default TemplateGridComponent;