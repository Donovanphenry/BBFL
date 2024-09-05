import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated }) => (
  isAuthenticated ? <Outlet/> : <Navigate to='/login'/>
);

export default ProtectedRoute;
