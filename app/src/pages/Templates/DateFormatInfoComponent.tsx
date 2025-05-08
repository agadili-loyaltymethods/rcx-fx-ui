import React from 'react';

interface Props {
  onClose: () => void;
}

const DateFormatInfoComponent: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="rounded-lg shadow-md bg-white w-full max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Date Format Information</h2>
        <button
          type="button"
          className="focus:outline-none text-gray-500 hover:text-gray-900"
          onClick={onClose}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <p className="text-gray-600 mb-4">
        Below you will find what each variable represents:
      </p>
      <div className="mb-4">
        <ul>
          <li className="text-gray-600 mb-2">
            <b>DD</b> - Numeric month (ex. 01,02,03,04) 
          </li>
          <li className="text-gray-600 mb-2">
            <b>dd</b> - Abbreviated day of the week (ex. Mon, Tue, Wed)
          </li>
          <li className="text-gray-600 mb-2">
            <b>HH</b> - Hour, 2 digits in 24 hour clock (ex. 01, 02, 03)
          </li>
          <li className="text-gray-600 mb-2">
            <b>hh</b> - Hour, 2 digits in 12 hour clock (ex. 01, 02, 03)
          </li>
          <li className="text-gray-600 mb-2">
            <b>MMM</b> - Abbreviated month (ex. Jan, Feb, Mar)
          </li>
          <li className="text-gray-600 mb-2">
            <b>MM</b> - Numeric month(ex. 01,02,03,04)
          </li>
          <li className="text-gray-600 mb-2">
            <b>mm</b> - Abbreviated minutes (ex. 01, 02, 03)
          </li>
          <li className="text-gray-600 mb-2">
            <b>SS</b> - Second, 2 digits in 24 hours (ex. 01, 02, 03)
          </li>
          <li className="text-gray-600 mb-2">
            <b>ss</b> - Second, 2 digits in 12 hours (ex. 01, 02, 03)
          </li>
          <li className="text-gray-600 mb-2">
            <b>YYYY</b> - Week year, or the year the week falls into (ex. 2023,2024,2025)
          </li>
          <li className="text-gray-600 mb-2">
            <b>yyyy</b> - Calendar year (ex. 2023, 2024, 2025)
          </li>
        </ul>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Ok
        </button>
      </div>
    </div>
  );
};

export default DateFormatInfoComponent;