import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/contexts/ContentContext';
import {
    Globe,
    Home,
    FileText,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronRight,
    Search,
    Layout,
    Layers,
    Settings
} from 'lucide-react';

const ContentEditor = () => {
    const { content, loading: contentLoading } = useContent();
    const [localContent, setLocalContent] = useState({});
    const [currentLang, setCurrentLang] = useState('no');
    const [activeGroup, setActiveGroup] = useState('general');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, success, error

    useEffect(() => {
        if (content) {
            setLocalContent(JSON.parse(JSON.stringify(content)));
        }
    }, [content]);

    const groups = {
        general: { label: 'Generelt', icon: Globe, sections: ['nav', 'footer', 'contact'] },
        home: { label: 'Forside', icon: Home, sections: ['hero', 'about', 'services', 'projects', 'process', 'testimonial', 'blog'] },
        pages: { label: 'Undersider', icon: FileText, sections: ['project_details', 'blog_details', 'service_details'] },
    };

    const handleInputChange = (lang, section, keyPath, value) => {
        setLocalContent(prev => {
            const next = { ...prev };
            const keys = keyPath.split('.');
            let current = next[lang][section];

            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const response = await fetch('/api/content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localContent)
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

    if (contentLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    const renderFields = (obj, section, prefix = '', lang = currentLang) => {
        return Object.entries(obj).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return (
                    <div key={key} className="mt-8 mb-4 border-l-2 border-gray-100 pl-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">{key.replace(/_/g, ' ')}</h4>
                        {renderFields(value, section, `${prefix}${key}.`, lang)}
                    </div>
                );
            }

            const fullKey = `${prefix}${key}`;
            const isLong = value.length > 80;

            return (
                <div key={fullKey} className="mb-6 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block group-focus-within:text-brand transition-colors">
                        {key.replace(/_/g, ' ')}
                    </label>
                    {isLong ? (
                        <textarea
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all text-gray-700 min-h-[120px] resize-none"
                            value={value}
                            onChange={(e) => handleInputChange(lang, section, fullKey, e.target.value)}
                        />
                    ) : (
                        <input
                            type="text"
                            className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-transparent focus:border-brand/20 focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all text-gray-700 font-bold"
                            value={value}
                            onChange={(e) => handleInputChange(lang, section, fullKey, e.target.value)}
                        />
                    )}
                </div>
            );
        });
    };

    return (
        <div className="flex bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 min-h-[700px]">
            {/* Sidebar Navigation */}
            <aside className="w-64 border-r border-gray-50 p-6 flex flex-col justify-between bg-gray-50/30">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-8 px-2">
                        <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
                            <Layout className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-900">Innhold</span>
                    </div>

                    {Object.entries(groups).map(([id, group]) => {
                        const Icon = group.icon;
                        return (
                            <button
                                key={id}
                                onClick={() => setActiveGroup(id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeGroup === id
                                        ? 'bg-white text-brand shadow-sm border border-gray-100'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{group.label}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="bg-white p-4 rounded-3xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Språk i editor</p>
                    <div className="flex p-1 bg-gray-50 rounded-2xl gap-1">
                        <button
                            onClick={() => setCurrentLang('no')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${currentLang === 'no' ? 'bg-white shadow-sm text-brand' : 'text-gray-400'}`}
                        >
                            NO
                        </button>
                        <button
                            onClick={() => setCurrentLang('en')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${currentLang === 'en' ? 'bg-white shadow-sm text-brand' : 'text-gray-400'}`}
                        >
                            EN
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col h-[700px]">
                {/* Editor Topbar */}
                <header className="h-20 border-b border-gray-50 px-8 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold">
                        <span>{groups[activeGroup].label}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-gray-900 capitalize">{currentLang === 'no' ? 'Norsk' : 'Engelsk'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <AnimatePresence>
                            {saveStatus === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100"
                                >
                                    <CheckCircle className="w-4 h-4" /> Lagret
                                </motion.div>
                            )}
                            {saveStatus === 'error' && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 text-red-600 font-bold text-sm bg-red-50 px-4 py-2 rounded-full border border-red-100"
                                >
                                    <AlertCircle className="w-4 h-4" /> Feil
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all disabled:opacity-70 shadow-lg shadow-brand/10 active:scale-[0.98]"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Lagre endringer</>}
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Fields */}
                <div className="flex-grow overflow-y-auto p-10 space-y-16 custom-scrollbar">
                    {groups[activeGroup].sections.map(sectionKey => {
                        const sectionData = localContent[currentLang]?.[sectionKey];
                        if (!sectionData) return null;

                        return (
                            <section key={sectionKey} className="max-w-3xl mx-auto">
                                <div className="mb-10">
                                    <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight flex items-center gap-3">
                                        {sectionKey.replace(/_/g, ' ')}
                                    </h2>
                                    <div className="h-1 w-20 bg-brand mt-4 rounded-full opacity-20"></div>
                                </div>
                                <div className="space-y-8">
                                    {renderFields(sectionData, sectionKey)}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ContentEditor;
