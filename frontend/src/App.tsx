import { useState } from 'react';
import Header from './Components/Header';
import HomePage from './Pages/LandingPage';
import DashboardPage from './Pages/DataFeed';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard'>('home');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header 
        setCurrentPage={setCurrentPage} 
        currentPage={currentPage} 
      />
      {currentPage === 'home' ? <DashboardPage /> : <DashboardPage />}
    </div>
  );
}

export default App;