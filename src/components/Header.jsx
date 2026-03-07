import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { Menu, X, Globe } from 'lucide-react';

const Header = () => {
    const { currentLang, switchLanguage, t } = useSite();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.services'), path: '/services' },
        { name: t('nav.portfolio'), path: '/portfolio' },
        { name: t('nav.blog'), path: '/blog' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/img/logo/d.png" alt="TK-design" className="h-10 w-auto" />
                    <span className={`text-2xl font-bold ${isScrolled ? 'text-[#1B4965]' : 'text-[#1B4965]'}`}>
                        TK-design
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`text-sm font-medium transition-colors hover:text-[#1B4965] ${location.pathname === link.path ? 'text-[#1B4965]' : 'text-gray-600'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <button
                        onClick={() => switchLanguage(currentLang === 'no' ? 'en' : 'no')}
                        className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-[#1B4965] transition-colors"
                    >
                        <Globe className="w-4 h-4" />
                        {currentLang.toUpperCase()}
                    </button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-[#1B4965]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 w-full bg-white shadow-xl py-8 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-medium text-gray-800"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr />
                            <button
                                onClick={() => {
                                    switchLanguage(currentLang === 'no' ? 'en' : 'no');
                                    setIsMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-2 text-lg font-medium text-gray-800"
                            >
                                <Globe className="w-5 h-5" />
                                {currentLang === 'no' ? 'English' : 'Norsk'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
