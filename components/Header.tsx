
import React from 'react';
import { Page } from '../App';
import { UserIcon } from './icons/UserIcon';
import { HomeIcon } from './icons/HomeIcon';
import { LogoIcon } from './icons/LogoIcon';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon } from './icons/LogoutIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { JournalIcon } from './icons/JournalIcon';

interface HeaderProps {
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    onOpenDevSettings: () => void;
}

const NavButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-indigo-800 hover:bg-amber-50/60'
            }`}
        >
            {children}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onOpenDevSettings }) => {
  const { user, logOut } = useAuth();
  
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <LogoIcon className="w-48 h-auto text-rose-500" />
            {user && (
                 <nav className="hidden md:flex items-center space-x-1">
                    <NavButton onClick={() => setCurrentPage('dashboard')} isActive={currentPage === 'dashboard'}>
                        <HomeIcon className="w-5 h-5" />
                        <span>Dashboard</span>
                    </NavButton>
                    <NavButton onClick={() => setCurrentPage('journal')} isActive={currentPage === 'journal'}>
                        <JournalIcon className="w-5 h-5" />
                        <span>Journal</span>
                    </NavButton>
                    <NavButton onClick={() => setCurrentPage('austin')} isActive={currentPage === 'austin'}>
                        <UserIcon className="w-5 h-5" />
                        <span>Austin</span>
                    </NavButton>
                    <NavButton onClick={() => setCurrentPage('angie')} isActive={currentPage === 'angie'}>
                        <UserIcon className="w-5 h-5" />
                        <span>Angie</span>
                    </NavButton>
                </nav>
            )}
          </div>
          
          {user && (
              <div className="flex items-center space-x-4">
                  <div className='text-right hidden lg:block'>
                    <p className='text-sm font-medium text-indigo-900'>{user.displayName || 'User'}</p>
                    <p className='text-xs text-indigo-700/80'>{today}</p>
                  </div>
                  <button
                      onClick={onOpenDevSettings}
                      className="p-2 rounded-full text-indigo-700 hover:bg-amber-100 transition-colors"
                      aria-label="Open Developer Settings"
                  >
                      <SettingsIcon className="w-5 h-5" />
                  </button>
                  <button onClick={logOut} className="p-2 rounded-full text-indigo-700 hover:bg-rose-100 hover:text-red-500 transition-colors" aria-label='Logout'>
                      <LogoutIcon className="w-5 h-5" />
                  </button>
              </div>
          )}
        </div>
      </div>
      {user && (
        <div className="md:hidden border-t border-slate-200/80">
            <nav className="flex justify-around items-center p-1">
                <NavButton onClick={() => setCurrentPage('dashboard')} isActive={currentPage === 'dashboard'}>
                    <HomeIcon className="w-5 h-5" />
                </NavButton>
                <NavButton onClick={() => setCurrentPage('journal')} isActive={currentPage === 'journal'}>
                    <JournalIcon className="w-5 h-5" />
                </NavButton>
                <NavButton onClick={() => setCurrentPage('austin')} isActive={currentPage === 'austin'}>
                    <UserIcon className="w-5 h-5" />
                </NavButton>
                <NavButton onClick={() => setCurrentPage('angie')} isActive={currentPage === 'angie'}>
                    <UserIcon className="w-5 h-5" />
                </NavButton>
            </nav>
        </div>
       )}
    </header>
  );
};