import { useState, useEffect } from 'react';
import api from '../utils/Api';
import { getAccessToken, isAuthenticated } from '../utils/authUtils';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Check if user is authenticated first
        if (!isAuthenticated()) {
          window.location.href = '/login';
          return;
        }

        setLoading(true);
        // Use explicit header for this critical request
        const token = getAccessToken();
        console.log('Fetching profile with token:', token?.substring(0, 15) + '...');
        
        const response = await api.get('/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Profile Response:', response.data);
        setUser(response.data.user);
        setError('');
      } catch (err: any) {
        console.error('Profile Fetch Error:', err);
        if (err.response) {
          console.error('Error response:', err.response.status, err.response.data);
          setError(`Failed to fetch profile: ${err.response.data.message || err.response.statusText || err.message}`);
        } else {
          setError('Failed to fetch profile: Network error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="text-center p-8">Loading profile...</div>;
  if (error) return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <div className="text-center text-red-500 p-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.location.href = '/login'}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
  
  if (!user) return <div className="text-center text-red-500">No profile data available</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
        <p><strong>Email Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
        <p><strong>Phone Verified:</strong> {user.isPhoneVerified ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default Profile;