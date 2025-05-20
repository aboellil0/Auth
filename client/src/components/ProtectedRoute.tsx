import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/profile`)
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        setIsAuthenticated(false);
        navigate('/login');
      });
  }, [navigate]);

  if (isAuthenticated === null) return <div>Loading...</div>;
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;