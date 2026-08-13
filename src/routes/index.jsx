import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import CustomerLayout from '../components/layout/CustomerLayout';
import ArtisanLayout from '../components/layout/ArtisanLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import PlaceholderPage from '../pages/PlaceholderPage';
import About from '../pages/About';
import Contact from '../pages/Contact';
import FAQ from '../pages/FAQ';

// Dashboard Indexes
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import ArtisanDashboard from '../pages/artisan/ArtisanDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

// Customer Pages
import CustomerSearch from '../pages/customer/Search';
import CustomerBookings from '../pages/customer/Bookings';
import Messages from '../pages/customer/Messages';
import CustomerWallet from '../pages/customer/Wallet';
import CustomerProfile from '../pages/customer/Profile';
import CustomerSettings from '../pages/customer/Settings';

// Artisan Pages
import ArtisanJobs from '../pages/artisan/Jobs';
import ArtisanCalendar from '../pages/artisan/Calendar';
import ArtisanWallet from '../pages/artisan/Wallet';
import ArtisanPortfolio from '../pages/artisan/Portfolio';
import ArtisanReviews from '../pages/artisan/Reviews';
import ArtisanProfile from '../pages/artisan/Profile';
import ArtisanSettings from '../pages/artisan/Settings';

// Admin Pages
import AdminUsers from '../pages/admin/Users';
import AdminVerification from '../pages/admin/Verification';
import AdminCategories from '../pages/admin/Categories';
import AdminBookings from '../pages/admin/Bookings';
import AdminPayments from '../pages/admin/Payments';
import AdminDisputes from '../pages/admin/Disputes';
import AdminSettings from '../pages/admin/Settings';

export const router = createBrowserRouter([
  // Public Client Routes
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'about', element: <About /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'privacy', element: <PlaceholderPage title="Privacy Policy" /> },
      { path: 'terms', element: <PlaceholderPage title="Terms & Conditions" /> },
    ],
  },
  
  // Customer Dashboard Routes
  {
    path: '/customer',
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CustomerDashboard /> },
      { path: 'search', element: <CustomerSearch /> },
      { path: 'bookings', element: <CustomerBookings /> },
      { path: 'messages', element: <Messages /> },
      { path: 'favorites', element: <PlaceholderPage title="My Favorite Artisans" /> },
      { path: 'wallet', element: <CustomerWallet /> },
      { path: 'profile', element: <CustomerProfile /> },
      { path: 'settings', element: <CustomerSettings /> },
      { path: 'notifications', element: <PlaceholderPage title="Notifications Hub" /> },
    ],
  },

  // Artisan Dashboard Routes
  {
    path: '/artisan',
    element: (
      <ProtectedRoute allowedRoles={['artisan']}>
        <ArtisanLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <ArtisanDashboard /> },
      { path: 'jobs', element: <ArtisanJobs /> },
      { path: 'calendar', element: <ArtisanCalendar /> },
      { path: 'wallet', element: <ArtisanWallet /> },
      { path: 'portfolio', element: <ArtisanPortfolio /> },
      { path: 'reviews', element: <ArtisanReviews /> },
      { path: 'profile', element: <ArtisanProfile /> },
      { path: 'settings', element: <ArtisanSettings /> },
      { path: 'messages', element: <Messages /> },
      { path: 'notifications', element: <PlaceholderPage title="Notifications Hub" /> },
    ],
  },

  // Admin Dashboard Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'verification', element: <AdminVerification /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'bookings', element: <AdminBookings /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'disputes', element: <AdminDisputes /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'notifications', element: <PlaceholderPage title="Notifications Hub" /> },
    ],
  },
  
  // 404 Fallback
  {
    path: '*',
    element: <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6"><PlaceholderPage title="404 - Page Not Found" /></div>,
  }
]);
