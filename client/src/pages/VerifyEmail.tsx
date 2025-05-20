import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const VerifyEmail: React.FC = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) setToken(tokenFromUrl);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_BASE_URL}/verify-email`, { token });
      setSuccess('Email verified successfully!');
      setTimeout(() => navigate('/verify-phone'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Verification Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default VerifyEmail;