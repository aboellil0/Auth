import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api, { API_BASE_URL } from '../utils/Api';

const VerifyPhone: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post(`${API_BASE_URL}/verify-phone`, { code });
      setSuccess('Phone verified successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Verify Phone</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Verification Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Verify Phone
        </button>
      </form>
    </div>
  );
};

export default VerifyPhone;