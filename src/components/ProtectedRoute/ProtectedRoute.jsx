import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => {
  const loc = useLocation();
  return isAuthenticated ? <Outlet/> : <Navigate to='/login' state={{ from: loc }}/>
};

export default ProtectedRoute;
