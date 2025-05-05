import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { IoArrowForward } from 'react-icons/io5';

interface StatusCardsProps {
  runsCount: {
    failed: {
      prev: number;
      curr: number;
    };
    succeeded: {
      prev: number;
      curr: number;
    };
  };
  integrationsCount: {
    failed: {
      prev: number;
      curr: number;
    };
    succeeded: {
      prev: number;
      curr: number;
    };
  };
  dateRange: any;
  filterDuration: string;
}

const StatusCards: React.FC<StatusCardsProps> = ({
  runsCount,
  integrationsCount,
  dateRange,
  filterDuration
}) => {
  const navigate = useNavigate();
  const cards = [
    {
      label: "Failed Runs",
      name: "failedRunsCount",
      value: runsCount.failed.curr,
      diff: runsCount.failed.curr - runsCount.failed.prev,
      status: 'failed'
    },
    {
      label: "Succeeded Runs",
      name: "succeededRunsCount",
      value: runsCount.succeeded.curr,
      diff: runsCount.succeeded.curr - runsCount.succeeded.prev,
      status: 'succeeded'
    },
    {
      label: "Failed Integrations",
      name: "failedIntsCount",
      value: integrationsCount.failed.curr,
      diff: integrationsCount.failed.curr - integrationsCount.failed.prev,
      status: 'failed'
    },
    {
      label: "Succeeded Integrations",
      name: "succeededIntsCount",
      value: integrationsCount.succeeded.curr,
      diff: integrationsCount.succeeded.curr - integrationsCount.succeeded.prev,
      status: 'succeeded'
    }
  ];

  const handleRedirect = (card: any) => {
    const state = {
      statusFilter: card.status === 'failed' ? 'Failed' : 'Succeeded',
      filterDuration,
      dateRange,
    };
    navigate('/run-history', { state });
  };

  return (
    <div className="grid grid-cols-4 gap-4 p-6 border-t border-gray-200">
      {cards.map((card, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-medium">{card.label}</h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center">
              <span className="text-2xl font-semibold">{card.value}</span>
              <div className={`ml-2 px-2 py-1 rounded-full flex items-center ${
                card.diff >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
                {card.diff >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                <span className="ml-1">{Math.abs(card.diff)}</span>
              </div>
            </div>
            <button 
              onClick={() => handleRedirect(card)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <IoArrowForward className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusCards;