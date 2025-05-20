import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

interface User {
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_BASE_URL}/profile`)
      .then((res) => setUser(res.data.user))
      .catch((err) => setError('Failed to fetch profile'));
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
      <p><strong>Email Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
      <p><strong>Phone Verified:</strong> {user.isPhoneVerified ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default Profile;