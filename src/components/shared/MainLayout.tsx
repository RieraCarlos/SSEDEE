import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from '../Landing/Nav';
import Footer from '../Landing/Footer';

/**
 * MainLayout Component
 * Encapsulates the persistent UI elements (Navbar and Footer) 
 * to prevent unmounting/remounting during navigation.
 */
const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#07080a] text-white flex flex-col font-sans selection:bg-emerald-500/30">
            <Nav />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
