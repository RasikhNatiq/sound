import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MobileFrame from './components/ui/MobileFrame';
import Button from './components/ui/Button';
import LandingPage from './pages/LandingPage';
import RealTimePage from './pages/RealTimePage';
import ContinuousPage from './pages/ContinuousPage';
import HistoryPage from './pages/HistoryPage';

export function OptionsMenu() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-4 rounded-full p-3 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu size={24} />
      </Button>

      {isOpen && (
        <div className="absolute top-[60px] right-4 bg-gray-900 rounded-lg shadow-xl p-2 z-50">
          <div className="flex flex-col space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigate('/');
                setIsOpen(false);
              }}
            >
              Home
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                navigate('/continuous');
                setIsOpen(false);
              }}
            >
              Continuous Processing
            </Button>
             <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                navigate('/real-time');
                setIsOpen(false);
              }}
            >
              Real-Time Processing
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => {
                navigate('/history');
                setIsOpen(false);
              }}
            >
              View History
            </Button>
           
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MobileFrame>
        <div className="relative h-full">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/real-time" element={<RealTimePage />} />
            <Route path="/continuous" element={<ContinuousPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
          <OptionsMenu />
        </div>
      </MobileFrame>
    </BrowserRouter>
  );
}

export default App;