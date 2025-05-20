import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 p-4 w-full">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">Auth App</div>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:underline">Home</Link>
          <Link to="/register" className="text-white hover:underline">Register</Link>
          <Link to="/login" className="text-white hover:underline">Login</Link>
          <Link to="/profile" className="text-white hover:underline">Profile</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;