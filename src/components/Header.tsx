import { Menu, Maximize2, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    // Adjust time by 8 hours as requested
    const adjustedDate = new Date(date.getTime() - (8 * 60 * 60 * 1000));
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    };
    return adjustedDate.toLocaleString('en-US', options);
  };

  return (
    <header className="bg-orange-500 h-16 flex items-center justify-between px-6 text-white fixed top-0 left-56 right-0 z-40">
      <div className="flex items-center space-x-6">
        <button className="hover:bg-orange-600 p-1 rounded transition-colors">
          <Menu size={24} />
        </button>
        <button className="hover:bg-orange-600 p-1 rounded transition-colors">
          <Maximize2 size={20} />
        </button>
        <div className="text-sm font-medium">
          <div className="uppercase text-[10px] opacity-80">Current Panel Time:</div>
          <div className="flex items-center space-x-1">
            <span className="opacity-80">🕒</span>
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <img 
            src="https://flagcdn.com/w20/us.png" 
            alt="USA" 
            className="w-5 h-auto rounded-sm shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>
        <button className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors">
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
