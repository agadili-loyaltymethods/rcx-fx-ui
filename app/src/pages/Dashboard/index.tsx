import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useAlert } from '@/hooks/useAlert';
import StatusCards from './StatusCards';
import IntegrationOperationsChart from './IntegrationOperationsChart';
import { sharedConstants } from '@/shared';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { errorAlert } = useAlert();
  
  const [viewStyle, setViewStyle] = useState<'table' | 'chart'>(
    localStorage.getItem('dashboardTableView') === 'false' ? 'chart' : 'table'
  );
  const [filterDuration, setFilterDuration] = useState<string>(
    localStorage.getItem('daysDuration') || 'day'
  );
  const [failedData, setFailedData] = useState<any[]>([]);
  const [succeededData, setSucceededData] = useState<any[]>([]);
  const [totalData, setTotalData] = useState<any[]>([]);
  const [totalCurrData, setTotalCurrData] = useState<any[]>([]);
  const [runsCount, setRunsCount] = useState({
    failed: { prev: 0, curr: 0 },
    succeeded: { prev: 0, curr: 0 },
  });
  const [integrationsCount, setIntegrationsCount] = useState({
    failed: { prev: 0, curr: 0 },
    succeeded: { prev: 0, curr: 0 },
  });
  const [dateRange, setDateRange] = useState<any>(null);

  const timeMap = {
    day: 86400000 * 2,
    week: 86400000 * 14,
    month: 86400000 * 60,
  };

  const isCurrPeriodData = useCallback((currentDate: Date, data: any) => {
    return moment(data.startTime).isAfter(
      moment(currentDate)
        .subtract(timeMap[filterDuration as keyof typeof timeMap] / 2, 'milliseconds')
        .startOf('day')
    );
  }, [filterDuration, timeMap]);

  const calculateDuration = (startTime: string, endTime: string): string => {
    const durationInSeconds = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000;
    let result = '';
    let duration = durationInSeconds;
    
    if (duration >= 3600) {
      result = Math.floor(duration / 3600) + 'h ';
      duration = duration % 3600;
    }
    if (duration >= 60) {
      result += Math.floor(duration / 60) + 'm ';
      duration = duration % 60;
    }
    if (duration) {
      result += Math.floor(duration) + 's';
    }
    return result.trim();
  };

  const getData = async () => {
    setTotalCurrData([]);
    setRunsCount({
      failed: { prev: 0, curr: 0 },
      succeeded: { prev: 0, curr: 0 },
    });
    setFailedData([]);
    setSucceededData([]);
    
    const currentDate = new Date();
    const newDateRange = {
      startDate: currentDate.getTime() - timeMap[filterDuration as keyof typeof timeMap],
      actualStartDate: currentDate.getTime() - timeMap[filterDuration as keyof typeof timeMap] / 2,
      endDate: currentDate.getTime(),
    };

    if (filterDuration !== 'day') {
      newDateRange.startDate = moment(new Date(newDateRange.startDate))
        .startOf('day')
        .valueOf();
      newDateRange.actualStartDate = moment(new Date(newDateRange.actualStartDate))
        .startOf('day')
        .valueOf();
      newDateRange.endDate = moment(new Date(newDateRange.endDate))
        .endOf('day')
        .valueOf();
    }

    setDateRange(newDateRange);

    try {
      const response = await axios.get('/api/runhistories', {
        params: {
          query: JSON.stringify({
            startTime: {
              $gte: newDateRange.startDate,
              $lte: newDateRange.endDate,
            },
          }),
          populate: JSON.stringify([{ path: 'integrationId', select: 'name' }]),
          sort: JSON.stringify({ _id: -1 }),
        },
      });

      const fetchedTotalData = response.data;
      setTotalData(fetchedTotalData);

      const newRunsCount = {
        failed: { prev: 0, curr: 0 },
        succeeded: { prev: 0, curr: 0 },
      };

      const failedIntegrations: any = { prev: {}, curr: {} };
      const succeededIntegrations: any = { prev: {}, curr: {} };
      let processingCount = 0;

      const newTotalCurrData: any[] = [];
      const newFailedData: any[] = [];
      const newSucceededData: any[] = [];

      fetchedTotalData.forEach((data: any) => {
        const integrationId = data.integrationId?._id || data.integrationId;

        if (data.startTime && data.endTime) {
          data.duration = calculateDuration(data.startTime, data.endTime);
        }

        const isCurrentData = isCurrPeriodData(currentDate, data);

        if (isCurrentData) {
          newTotalCurrData.push(data);
        }

        if (data.status === 'Failed') {
          if (!isCurrentData) {
            newRunsCount.failed.prev += 1;
            if (!failedIntegrations.prev[integrationId]) {
              failedIntegrations.prev[integrationId] = true;
            }
          } else {
            newRunsCount.failed.curr += 1;
            if (newRunsCount.failed.curr <= 5) {
              newFailedData.push(data);
            }
            if (!failedIntegrations.curr[integrationId]) {
              failedIntegrations.curr[integrationId] = true;
            }
          }
        } else {
          if (!isCurrentData && data.status === 'Succeeded') {
            newRunsCount.succeeded.prev += 1;
            if (!succeededIntegrations.prev[integrationId]) {
              succeededIntegrations.prev[integrationId] = true;
            }
          } else {
            if (data.status === 'Processing') {
              processingCount += 1;
            }
            if (data.status === 'Succeeded') {
              newRunsCount.succeeded.curr += 1;
              if (!succeededIntegrations.curr[integrationId]) {
                succeededIntegrations.curr[integrationId] = true;
              }
            }
            if (newRunsCount.succeeded.curr + processingCount <= 5) {
              newSucceededData.push(data);
            }
          }
        }
      });

      setTotalCurrData(newTotalCurrData);
      setFailedData(newFailedData);
      setSucceededData(newSucceededData);
      setRunsCount(newRunsCount);

      const counts = {
        failed: {
          prev: Object.keys(failedIntegrations.prev).length || 0,
          curr: Object.keys(failedIntegrations.curr).length || 0,
        },
        succeeded: {
          prev: Object.keys(succeededIntegrations.prev).length || 0,
          curr: Object.keys(succeededIntegrations.curr).length || 0,
        },
      };
      
      setIntegrationsCount(counts);
    } catch (error) {
      errorAlert(sharedConstants.defaultErrorMessage);
    }
  };

  useEffect(() => {
    getData();
  }, [filterDuration]);

  const gotoRunHistory = (element: any) => {
    navigate('/run-history', {
      state: {
        element: { name: element?.runId, id: element?._id },
        filterDuration,
        statusFilter: element.status,
      }
    });
  };

  const viewAll = (status: string) => {
    navigate('/run-history', {
      state: {
        statusFilter: status,
        dateRange,
        filterDuration,
      }
    });
  };

  const viewData = (isTable: boolean) => {
    localStorage.setItem('dashboardTableView', String(isTable));
    setViewStyle(isTable ? 'table' : 'chart');
  };

  const daysFilter = (value: string) => {
    localStorage.setItem('daysDuration', value);
    setFilterDuration(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex space-x-2">
              {['day', 'week', 'month'].map((duration) => (
                <button
                  key={duration}
                  onClick={() => daysFilter(duration)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    filterDuration === duration
                      ? 'bg-blue-50 text-blue-700 border border-blue-300'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {duration === 'day' ? 'Last 24 Hours' : 
                   duration === 'week' ? 'Last 7 Days' : 
                   'Last 1 Month'}
                </button>
              ))}
            </div>
          </div>

          <StatusCards
            runsCount={runsCount}
            integrationsCount={integrationsCount}
            dateRange={dateRange}
            filterDuration={filterDuration}
          />

          <div className="border-t border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Operations</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => viewData(true)}
                className={`p-2 rounded ${viewStyle === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <span className="sr-only">Table view</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => viewData(false)}
                className={`p-2 rounded ${viewStyle === 'chart' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <span className="sr-only">Chart view</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 13v-1m4 1v-3m4 3V8M12 21l9-9-9-9-9 9 9 9z" />
                </svg>
              </button>
            </div>
          </div>

          {viewStyle === 'table' ? (
            <div className="p-6 space-y-6">
              {/* Failed Operations Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Failed</h3>
                  <button
                    onClick={() => viewAll('Failed')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {failedData.map((item, index) => (
                        <tr
                          key={index}
                          onClick={() => gotoRunHistory(item)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.runId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.integrationId?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {moment(item.startTime).format('MMM DD, YYYY hh:mm A')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.endTime ? moment(item.endTime).format('MMM DD, YYYY hh:mm A') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Processing and Succeeded Operations Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Processing and Succeeded</h3>
                  <button
                    onClick={() => viewAll('Succeeded')}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Run ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Integration Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {succeededData.map((item, index) => (
                        <tr
                          key={index}
                          onClick={() => gotoRunHistory(item)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{item.runId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.integrationId?.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'Processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {moment(item.startTime).format('MMM DD, YYYY hh:mm A')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.endTime ? moment(item.endTime).format('MMM DD, YYYY hh:mm A') : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <IntegrationOperationsChart
                totalData={totalCurrData}
                filterDuration={filterDuration}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;