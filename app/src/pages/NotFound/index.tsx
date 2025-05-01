import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-8xl m-0 text-primary">404</h1>
      <p className="text-2xl my-4 text-gray-600">Page not found</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white rounded hover:bg-secondary transition-colors no-underline"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;