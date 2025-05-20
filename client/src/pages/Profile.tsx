import { useState, useEffect } from 'react';
import api from '../utils/Api'; // Import the custom Axios instance
import { API_BASE_URL } from '../utils/Api';

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
    const fetchProfile = async () => {
      try {
        const response = await api.get<{ user: User }>(`${API_BASE_URL}/profile`);
        setUser(response.data.user);
      } catch (err) {
        setError('Failed to fetch profile');
      }
    };

    fetchProfile();
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