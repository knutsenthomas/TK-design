import React from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';

const Footer = () => {
    const { t } = useSite();
    const year = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <img src="/img/logo/d.png" alt="TK-design" className="h-10 w-auto" />
                            <span className="text-2xl font-bold text-[#1B4965]">TK-design</span>
                        </Link>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            {t('footer.intro')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-[#1B4965] uppercase tracking-wider mb-6">Navigasjon</h4>
                        <ul className="space-y-4">
                            <li><Link to="/" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('nav.home')}</Link></li>
                            <li><Link to="/about" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('nav.about')}</Link></li>
                            <li><Link to="/portfolio" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('nav.portfolio')}</Link></li>
                            <li><Link to="/contact" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('nav.contact')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-[#1B4965] uppercase tracking-wider mb-6">Juridisk</h4>
                        <ul className="space-y-4">
                            <li><Link to="/privacy" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('footer.privacy')}</Link></li>
                            <li><Link to="/terms" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('footer.terms')}</Link></li>
                            <li><Link to="/accessibility" className="text-gray-600 hover:text-[#1B4965] transition-colors">{t('footer.accessibility')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-400 text-sm">
                        {t('footer.copyright')} {year} TK-design. {t('footer.rights')}
                    </p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="text-gray-400 hover:text-[#1B4965] transition-colors">LinkedIn</a>
                        <a href="#" className="text-gray-400 hover:text-[#1B4965] transition-colors">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
