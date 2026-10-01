import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';

const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8FBFA]">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
