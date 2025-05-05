import { Link } from 'react-router-dom';
import './NotFound.module.css';

const NotFound = () => {
  return (
    <div className="container">
      <h1>404</h1>
      <p>Page not found</p>
      <Link to="/" className="link">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;