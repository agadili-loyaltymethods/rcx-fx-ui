import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl m-0 text-blue-900">404</h1>
      <p className="text-2xl my-4 text-gray-600">Page not found</p>
      <Link to="/" className="py-3 px-6 bg-blue-900 text-white no-underline rounded hover:bg-blue-800 transition-colors">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;