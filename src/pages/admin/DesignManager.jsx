import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Type,
    Save,
    Loader2,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Layout,
    Eye
} from 'lucide-react';

const DesignManager = () => {
    const [styles, setStyles] = useState({
        '--clr-base': '#1B4965',
        '--theme-bg': '#FFFFFF',
        '--clr-common-text': '#475569',
        fontFamily: "'Inter', sans-serif",
        fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        fetchStyles();
    }, []);

    const fetchStyles = async () => {
        try {
            const response = await fetch('/api/style');
            if (response.ok) {
                const data = await response.json();
                if (data.cssVariables) {
                    setStyles({
                        ...data.cssVariables,
                        fontFamily: data.fontFamily || styles.fontFamily,
                        fontUrl: data.fontUrl || styles.fontUrl
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch styles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        try {
            const response = await fetch('/api/style', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cssVariables: {
                        '--clr-base': styles['--clr-base'],
                        '--theme-bg': styles['--theme-bg'],
                        '--clr-common-text': styles['--clr-common-text']
                    },
                    fontFamily: styles.fontFamily,
                    fontUrl: styles.fontUrl
                })
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

    const fonts = [
        { name: 'Inter', value: "'Inter', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap' },
        { name: 'Outfit', value: "'Outfit', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap' },
        { name: 'Plus Jakarta Sans', value: "'Plus Jakarta Sans', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700;800&display=swap' },
        { name: 'Space Grotesk', value: "'Space Grotesk', sans-serif", url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' }
    ];

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Design & Profil</h1>
                    <p className="text-gray-500 mt-1 font-medium">Tilpass farger, fonter og det visuelle uttrykket</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-2xl font-bold active:scale-[0.98] transition-all shadow-lg shadow-brand/10 disabled:opacity-70"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Lagre design</>}
                </button>
            </header>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-8">
                    <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand/5 rounded-xl flex items-center justify-center text-brand">
                                <Palette className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Merkevarefarger</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Hovedfarge (Brand)</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            className="w-16 h-16 rounded-2xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                                            value={styles['--clr-base']}
                                            onChange={(e) => setStyles({ ...styles, '--clr-base': e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-grow px-5 py-3 rounded-xl bg-gray-50 border-none font-bold text-gray-700 uppercase"
                                            value={styles['--clr-base']}
                                            onChange={(e) => setStyles({ ...styles, '--clr-base': e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Bakgrunnsfarge</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            className="w-16 h-16 rounded-2xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                                            value={styles['--theme-bg']}
                                            onChange={(e) => setStyles({ ...styles, '--theme-bg': e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            className="flex-grow px-5 py-3 rounded-xl bg-gray-50 border-none font-bold text-gray-700 uppercase"
                                            value={styles['--theme-bg']}
                                            onChange={(e) => setStyles({ ...styles, '--theme-bg': e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Standard tekstfarge</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        className="w-12 h-12 rounded-xl border-none cursor-pointer overflow-hidden p-0 bg-transparent"
                                        value={styles['--clr-common-text']}
                                        onChange={(e) => setStyles({ ...styles, '--clr-common-text': e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="flex-grow px-5 py-3 rounded-xl bg-gray-50 border-none font-bold text-gray-700 uppercase"
                                        value={styles['--clr-common-text']}
                                        onChange={(e) => setStyles({ ...styles, '--clr-common-text': e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand/5 rounded-xl flex items-center justify-center text-brand">
                                <Type className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Typografi</h2>
                        </div>

                        <div className="grid gap-4">
                            {fonts.map((f) => (
                                <button
                                    key={f.name}
                                    onClick={() => setStyles({ ...styles, fontFamily: f.value, fontUrl: f.url })}
                                    className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all ${styles.fontFamily === f.value ? 'border-brand bg-brand/5' : 'border-gray-50 hover:border-gray-100'}`}
                                >
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 mb-1">{f.name}</p>
                                        <p className="text-xs text-gray-400">Standard system-støtte</p>
                                    </div>
                                    <span className="text-2xl font-black text-brand" style={{ fontFamily: f.value }}>Aa</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Live Preview Sidebar */}
                <div className="sticky top-8 h-fit">
                    <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand opacity-20 blur-[120px]" />

                        <div className="relative space-y-8">
                            <div className="flex items-center gap-2 mb-12">
                                <div className="w-8 h-4 rounded-full bg-brand" />
                                <span className="font-black text-sm uppercase tracking-widest opacity-40">Live Forhåndsvisning</span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-black leading-tight" style={{ fontFamily: styles.fontFamily }}>
                                    Design for <span style={{ color: styles['--clr-base'] }}>fremtiden</span>
                                </h3>
                                <p className="text-gray-400 font-medium leading-relaxed" style={{ fontFamily: styles.fontFamily }}>
                                    Dette er et eksempel på hvordan dine valgte farger og fonter vil fungere sammen på den faktiske nettsiden.
                                </p>
                            </div>

                            <div className="pt-8 flex gap-4">
                                <div
                                    className="px-8 py-4 rounded-2xl font-bold text-white shadow-lg"
                                    style={{ backgroundColor: styles['--clr-base'], fontFamily: styles.fontFamily }}
                                >
                                    Start prosjekt
                                </div>
                                <div
                                    className="px-8 py-4 rounded-2xl font-bold border-2"
                                    style={{ borderColor: styles['--clr-base'], color: styles['--clr-base'], fontFamily: styles.fontFamily }}
                                >
                                    Se mer
                                </div>
                            </div>

                            <div className="pt-12 grid grid-cols-3 gap-4">
                                <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-end">
                                    <div className="w-6 h-6 rounded-full bg-brand mb-2" />
                                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                                </div>
                                <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-end">
                                    <div className="w-6 h-6 rounded-full bg-white/10 mb-2" />
                                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                                </div>
                                <div className="h-24 rounded-2xl bg-white/5 border border-white/5 p-4 flex flex-col justify-end">
                                    <div className="w-6 h-6 rounded-full bg-white/10 mb-2" />
                                    <div className="h-2 w-12 bg-white/10 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DesignManager;
