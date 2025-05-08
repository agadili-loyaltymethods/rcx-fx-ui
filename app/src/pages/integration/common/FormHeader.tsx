import React from 'react';

interface HeaderData {
  headerName: string;
  status?: string;
  lastUpdateBy?: string;
  date?: string;
  time?: string;
}

interface FormHeaderProps {
  headerData: HeaderData;
  properties?: any;
}

const FormHeader: React.FC<FormHeaderProps> = ({ headerData, properties }) => {
  return (
    <div className="inner-headerContainer border border-gray-200 border-b-0 rounded-t-lg py-6 px-5 flex justify-between items-center bg-white">
      <div className="left-elements flex items-center">
        <div className="right-child flex gap-4">
          <div className="temp-properties-name text-lg font-semibold">
            {headerData.headerName}
          </div>
          {headerData.status && (
            <div className="buttonBorder">
              <button className={`mat-raised-button-rev ${headerData.status}`}>
                <p>{headerData.status}</p>
              </button>
            </div>
          )}
        </div>
      </div>

      {headerData.lastUpdateBy && (
        <div className="right-elements">
          <div className="rightText flex flex-col">
            <div className="updatestatus flex justify-end">
              <p className="uname text-base font-medium text-gray-900 mb-0.5">Last Updated By</p>
            </div>
            <div className="rightBottomText flex gap-1">
              <div>
                <p className="name text-xs font-semibold text-gray-500">{headerData.lastUpdateBy}</p>
              </div>
              <div>
                <span className="material-icons text-sm text-gray-500">schedule</span>
              </div>
              <div>
                <p className="date text-xs font-normal text-gray-500">{headerData.date},</p>
              </div>
              <div>
                <p className="time text-xs font-normal text-gray-500">{headerData.time}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormHeader;