import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    PenNib,
    Layout,
    Palette,
    Search,
    Image,
    Mail,
    BarChart2,
    ExternalLink,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Settings,
    User as UserIcon
} from 'lucide-react';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const menuItems = [
        { name: 'Dashbord', icon: Home, path: '/admin/dashboard' },
        { name: 'Sideinnhold', icon: Layout, path: '/admin/content' },
        { name: 'Blogg', icon: PenNib, path: '/admin/blog' },
        { name: 'Design', icon: Palette, path: '/admin/design' },
        { name: 'SEO', icon: Search, path: '/admin/seo' },
        { name: 'Media', icon: Image, path: '/admin/media' },
        { name: 'Meldinger', icon: Mail, path: '/admin/messages' },
        { name: 'Statistikk', icon: BarChart2, path: '/admin/analytics' },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-24'
                    } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed inset-y-0 z-50`}
            >
                <div className="h-20 flex items-center px-6 border-bottom border-gray-100 shrink-0">
                    <div className="admin-brand-chip bg-orange-50 text-orange-600 px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                        <Settings className="w-4 h-4" />
                        <span className={isSidebarOpen ? 'block' : 'hidden'}>tk-design Studio</span>
                    </div>
                </div>

                <nav className="flex-grow py-6 overflow-y-auto px-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group ${isActive
                                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-brand'
                                    }`}
                            >
                                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand'}`} />
                                <span className={`font-bold transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-brand transition-all"
                    >
                        <ExternalLink className="w-6 h-6 text-gray-400" />
                        <span className={`font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Se Nettside</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut className="w-6 h-6" />
                        <span className={`font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Logg ut</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-grow flex flex-col ${isSidebarOpen ? 'pl-72' : 'pl-24'} transition-all duration-300`}>
                {/* Topbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6 text-gray-500" /> : <Menu className="w-6 h-6 text-gray-500" />}
                    </button>

                    <div className="flex items-center gap-4 relative">
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 p-2 pl-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all border-none"
                        >
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none">{user?.displayName || user?.email}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Administrator</p>
                            </div>
                            <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center font-bold relative overflow-hidden">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-5 h-5" />
                                )}
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isUserMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden"
                                >
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                        <UserIcon className="w-4 h-4 text-gray-400" /> Profil
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                        <Settings className="w-4 h-4 text-gray-400" /> Innstillinger
                                    </button>
                                    <div className="h-px bg-gray-100 my-2 mx-2"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" /> Logg ut
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
