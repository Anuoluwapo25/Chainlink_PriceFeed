import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentPage: 'home' | 'dashboard';
  setCurrentPage: (page: 'home' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <header className="py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        {currentPage === 'home' ? (
          <div className="text-xl font-bold">CoinMarket</div>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 mr-2">
              <img src="/logo.svg" alt="Logo" className="h-full" />
            </div>
            <div className="text-xl font-bold">btc·markets</div>
          </div>
        )}
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        {currentPage === 'home' ? (
          <>
            <a href="#" className="hover:text-blue-400">Community</a>
            <a href="#" className="hover:text-blue-400">Company</a>
            <a href="#" className="hover:text-blue-400">Contact</a>
          </>
        ) : (
          <>
            <a href="#" className="hover:text-blue-400">Features</a>
            <a href="#" className="hover:text-blue-400">Markets</a>
            <a href="#" className="hover:text-blue-400">Exchange</a>
            <a href="#" className="hover:text-blue-400">About</a>
          </>
        )}
      </nav>
      
      <div className="flex items-center space-x-3">
        <button 
          className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800"
          onClick={() => {}}
        >
          Log in
        </button>
        <button 
          className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          onClick={() => setCurrentPage(currentPage === 'home' ? 'dashboard' : 'home')}
        >
          {currentPage === 'home' ? 'Sign up' : 'Create account'}
        </button>
      </div>
    </header>
  );
};

export default Header;