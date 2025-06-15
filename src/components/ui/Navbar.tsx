import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, Upload } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-[420px] mx-auto">
        <nav className="flex justify-around items-center h-16 px-4">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}
            end
          >
            <Home size={24} />
            <span className="text-xs">Home</span>
          </NavLink>
          
          <NavLink 
            to="/real-time" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}
          >
            <Mic size={24} />
            <span className="text-xs">Real-Time</span>
          </NavLink>
          
          <NavLink 
            to="/continuous" 
            className={({ isActive }) => `flex flex-col items-center space-y-1 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}
          >
            <Upload size={24} />
            <span className="text-xs">Continuous</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;