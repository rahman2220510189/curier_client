import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, LogOut, Menu, X } from 'lucide-react'; 
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false); 

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getNavLinks = () => {
        switch (user?.role) {
            case 'admin':
                return [
                    { to: '/admin/dashboard', label: 'Dashboard' },
                    { to: '/admin/parcels', label: 'Parcels' },
                    { to: '/admin/users', label: 'Users' },
                    { to: '/admin/reports', label: 'Reports' }
                ];
            case 'agent':
                return [
                    { to: '/agent/parcels', label: 'My Parcels' },
                ];
            case 'customer':
                return [
                    { to: '/customer/book', label: 'Book Parcel' },
                    { to: '/customer/track', label: 'Track' },
                    { to: '/customer/bookings', label: 'My Bookings' }
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4">
                
                <div className="flex items-center justify-between h-16">
                    
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-3">
                            <Truck className="text-blue-600" size={32} />
                            <span className="text-xl font-bold text-gray-800">CourierTrack Pro</span>
                        </Link>
                    </div>

                    <div className="flex-1 hidden md:flex items-center justify-center">
                        <nav className="flex items-center gap-6">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className="text-gray-700 hover:text-blue-600 font-medium transition"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Desktop User Info */}
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                        
                        <button
                            className="p-2 md:hidden text-gray-600 hover:text-blue-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span> 
                        </button>
                    </div>
                </div>

            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 shadow-lg pb-2">
                    {/* Mobile User Info */}
                    <div className="p-4 border-b border-gray-100 text-center">
                        <p className="font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    
                    {/* Mobile Navigation Links */}
                    <nav className="flex flex-col space-y-1 p-2">
                        {navLinks.map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMenuOpen(false)} 
                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-md transition"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;