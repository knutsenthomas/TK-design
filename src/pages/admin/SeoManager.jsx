import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Globe,
    FileText,
    Settings,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    Link as LinkIcon,
    Eye,
    BarChart
} from 'lucide-react';

const SeoManager = () => {
    const [seoData, setSeoData] = useState({ global: {}, pages: {} });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [activeTab, setActiveTab] = useState('global');

    useEffect(() => {
        fetchSeo();
    }, []);

    const fetchSeo = async () => {
        try {
            const response = await fetch('/api/seo');
            if (response.ok) {
                const data = await response.json();
                setSeoData(data);
            }
        } catch (error) {
            console.error('Failed to fetch SEO:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const response = await fetch('/api/seo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seoData)
            });
            if (!response.ok) throw new Error('Failed to save');
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Søkemotoroptimalisering</h1>
                    <p className="text-gray-500 mt-1 font-medium">Administrer hvordan TK-design vises i søkeresultater</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-2xl font-bold active:scale-[0.98] transition-all shadow-lg shadow-brand/10 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Lagre SEO-innstillinger</>}
                </button>
            </header>

            {/* Main Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex min-h-[600px]">
                {/* Sidebar Tabs */}
                <aside className="w-64 border-r border-gray-50 p-6 bg-gray-50/30 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'global' ? 'bg-white shadow-sm text-brand border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Globe className="w-5 h-5" /> Globale valg
                    </button>
                    <button
                        onClick={() => setActiveTab('pages')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'pages' ? 'bg-white shadow-sm text-brand border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <FileText className="w-5 h-5" /> Side-SEO
                    </button>
                    <button
                        onClick={() => setActiveTab('sitemap')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'sitemap' ? 'bg-white shadow-sm text-brand border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <LinkIcon className="w-5 h-5" /> Sitemap & Roboter
                    </button>
                </aside>

                {/* Content Area */}
                <main className="flex-grow p-10 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'global' && (
                            <motion.div
                                key="global"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-2xl space-y-10"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Globale Innstillinger</h2>
                                    <p className="text-gray-400 text-sm font-medium">Disse gjelder for hele nettstedet med mindre noe annet er spesifisert.</p>
                                </div>

                                <div className="grid gap-8 border-l-2 border-gray-50 pl-8 ml-1">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nettstedsnavn</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-gray-700"
                                            value={seoData.global.siteTitle || ''}
                                            onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, siteTitle: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tittel-separator</label>
                                        <input
                                            type="text"
                                            className="w-full max-w-[100px] px-5 py-4 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-gray-700 text-center"
                                            value={seoData.global.separator || '|'}
                                            onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, separator: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Google Analytics ID</label>
                                        <div className="relative">
                                            <BarChart className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-5 py-4 rounded-2xl bg-gray-50 border-none focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all font-bold text-gray-700"
                                                placeholder="G-XXXXXXXXXX"
                                                value={seoData.global.googleAnalyticsId || ''}
                                                onChange={(e) => setSeoData({ ...seoData, global: { ...seoData.global, googleAnalyticsId: e.target.value } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'pages' && (
                            <motion.div
                                key="pages"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Side-spesifikk SEO</h2>
                                    <p className="text-gray-400 text-sm font-medium">Tilpass hvordan hver enkelt side ser ut i søkemotorer.</p>
                                </div>

                                <div className="grid gap-6">
                                    {Object.entries(seoData.pages).map(([path, config]) => (
                                        <div key={path} className="p-8 rounded-3xl bg-gray-50/50 border border-gray-100 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="px-3 py-1 bg-white shadow-sm border border-gray-100 rounded-lg text-xs font-black text-brand uppercase tracking-widest">/{path}</span>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sidetittel</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 focus:border-brand/20 outline-none font-bold text-gray-700 transition-all"
                                                        value={config.title || ''}
                                                        onChange={(e) => {
                                                            const newPages = { ...seoData.pages };
                                                            newPages[path].title = e.target.value;
                                                            setSeoData({ ...seoData, pages: newPages });
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Søkeord (komma-delt)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 focus:border-brand/20 outline-none font-bold text-gray-700 transition-all"
                                                        value={config.keywords || ''}
                                                        onChange={(e) => {
                                                            const newPages = { ...seoData.pages };
                                                            newPages[path].keywords = e.target.value;
                                                            setSeoData({ ...seoData, pages: newPages });
                                                        }}
                                                    />
                                                </div>
                                                <div className="md:col-span-2 space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Metabeskrivelse</label>
                                                    <textarea
                                                        rows="3"
                                                        className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 focus:border-brand/20 outline-none font-medium text-gray-700 transition-all resize-none"
                                                        value={config.description || ''}
                                                        onChange={(e) => {
                                                            const newPages = { ...seoData.pages };
                                                            newPages[path].description = e.target.value;
                                                            setSeoData({ ...seoData, pages: newPages });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'sitemap' && (
                            <motion.div
                                key="sitemap"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="max-w-2xl space-y-8"
                            >
                                <div className="p-8 rounded-[2rem] bg-blue-50 border border-blue-100/50">
                                    <h2 className="text-xl font-bold text-brand mb-4 flex items-center gap-2">
                                        <Eye className="w-6 h-6" /> Sitemap & Crawling
                                    </h2>
                                    <p className="text-blue-900/70 font-medium leading-relaxed mb-6">
                                        Sitemaps genereres automatisk hver gang du lagrer SEO-innstillinger eller publiserer et nytt blogginnlegg. Dette sørger for at Google alltid har den nyeste oversikten over dine sider.
                                    </p>
                                    <a
                                        href="/sitemap.xml"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand rounded-xl font-bold border border-blue-100 hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        Se live sitemap.xml
                                    </a>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default SeoManager;
