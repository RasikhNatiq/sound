import React from 'react';
import { OptionsMenu } from '../../App';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
      <div className="px-5 py-4 border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
    </div>
  );
};

export default Header;