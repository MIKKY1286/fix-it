import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiSearch, FiCalendar, FiMessageSquare, FiHeart, FiCreditCard, FiUser, FiSettings, FiBell, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/authContextValue';

const CustomerLayout = () => {
  const { userProfile, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/customer', icon: <FiHome size={18} /> },
    { name: 'Search Artisans', path: '/customer/search', icon: <FiSearch size={18} /> },
    { name: 'My Bookings', path: '/customer/bookings', icon: <FiCalendar size={18} /> },
    { name: 'Messages', path: '/customer/messages', icon: <FiMessageSquare size={18} /> },
    { name: 'Favorites', path: '/customer/favorites', icon: <FiHeart size={18} /> },
    { name: 'My Wallet', path: '/customer/wallet', icon: <FiCreditCard size={18} /> },
    { name: 'Profile', path: '/customer/profile', icon: <FiUser size={18} /> },
    { name: 'Settings', path: '/customer/settings', icon: <FiSettings size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.path === location.pathname);
    return activeItem ? activeItem.name : 'Customer Portal';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-secondary text-white shrink-0 border-r border-secondary-light/20 relative z-30">
        {/* Brand Logo */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              F
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Fix-<span className="text-primary">It</span>
            </span>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md">
            User
          </span>
        </div>

        {/* Navigation Feed */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/15' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-danger hover:bg-danger/5 transition-all duration-200"
          >
            <FiLogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main View Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-secondary/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-25">
          {/* Page Title & Mobile trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-secondary hover:bg-secondary/5 transition-colors duration-250"
            >
              <FiMenu size={20} />
            </button>
            <h2 className="text-lg font-bold text-secondary tracking-tight hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Link 
              to="/customer/notifications" 
              className="relative p-2 rounded-xl text-secondary/60 hover:text-secondary hover:bg-secondary/5 transition-all duration-200"
            >
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger animate-pulse" />
            </Link>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-sm">
                  {userProfile?.avatarText || 'C'}
                </div>
              </button>

              <AnimatePresence>
                {showUserDropdown && (
                  <React.Fragment>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowUserDropdown(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-secondary/5 shadow-xl z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3.5 border-b border-secondary/5">
                        <p className="text-xs font-semibold text-secondary/40 uppercase tracking-wider">Account</p>
                        <p className="text-sm font-bold text-secondary mt-0.5 truncate">{userProfile?.name || 'Customer User'}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/customer/profile"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-secondary/70 hover:bg-secondary/5 hover:text-secondary transition-colors duration-150"
                        >
                          <FiUser size={16} /> My Profile
                        </Link>
                        <Link
                          to="/customer/settings"
                          onClick={() => setShowUserDropdown(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-secondary/70 hover:bg-secondary/5 hover:text-secondary transition-colors duration-150"
                        >
                          <FiSettings size={16} /> Settings
                        </Link>
                      </div>
                      <div className="border-t border-secondary/5 py-1">
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors duration-150"
                        >
                          <FiLogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </React.Fragment>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Views Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Menu Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <React.Fragment>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-secondary/35 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 left-0 w-[80%] max-w-xs h-full z-45 bg-secondary text-white shadow-2xl p-6 flex flex-col justify-between lg:hidden"
            >
              <div className="space-y-8">
                {/* Brand Logo & Close */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-base">
                      F
                    </div>
                    <span className="text-base font-bold text-white tracking-tight">
                      Fix-<span className="text-primary">It</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-white/5 text-white/50 hover:text-white"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Mobile Navigation links */}
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                        ${location.pathname === item.path
                          ? 'bg-primary text-white' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div>
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:text-danger hover:bg-danger/5 transition-all duration-200"
                >
                  <FiLogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerLayout;
