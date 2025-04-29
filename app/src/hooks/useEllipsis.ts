import { useEffect, useRef, useState } from 'react';
import { useUiConfig } from './useUiConfig';

interface EllipsisProps {
  maxLength?: number;
  showEllipsis?: boolean;
  data?: string;
  ignoreFields?: string[];
  hoverData?: string;
}

export const useEllipsis = ({
  maxLength,
  showEllipsis = true,
  data,
  ignoreFields = [],
  hoverData
}: EllipsisProps) => {
  const elementRef = useRef<HTMLElement>(null);
  const [tooltip, setTooltip] = useState<string>('');
  const [displayText, setDisplayText] = useState<string>('');
  const { getCommonProperties } = useUiConfig();

  useEffect(() => {
    const updateText = async () => {
      const commonProperties = await getCommonProperties();
      const ellipsisMaxLength = maxLength || commonProperties?.ellipsisMaxLength;

      if (hoverData && !['false', 'undefined'].includes(hoverData)) {
        setTooltip(hoverData);
      } else if (data && !ignoreFields.includes(data)) {
        if (data.length > ellipsisMaxLength) {
          setTooltip(data);
          setDisplayText(data.substring(0, ellipsisMaxLength) + '...');
        } else {
          setDisplayText(data);
          setTooltip('');
        }
      } else if (data === '' || ignoreFields.includes(data)) {
        setDisplayText(data);
      }
    };

    if (showEllipsis !== false) {
      updateText();
    }
  }, [maxLength, showEllipsis, data, ignoreFields, hoverData]);

  return {
    elementRef,
    tooltip,
    displayText
  };
};