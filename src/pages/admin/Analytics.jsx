import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    Users,
    Clock,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    Monitor,
    Smartphone,
    Loader2
} from 'lucide-react';

const Analytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await fetch('/api/analytics');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    const cards = [
        { label: 'Besøk totalt', value: '1,280', change: '+12%', trend: 'up', icon: Eye },
        { label: 'Unike brukere', value: '850', change: '+5%', trend: 'up', icon: Users },
        { label: 'Gj.snitt tid', value: '2:45', change: '-2%', trend: 'down', icon: Clock },
        { label: 'Konvertering', value: '3.2%', change: '+0.8%', trend: 'up', icon: TrendingUp },
    ];

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900">Nettstedsstatistikk</h1>
                <p className="text-gray-500 mt-1 font-medium">Innsikt i hvordan besøkende bruker tk-design.no</p>
            </header>

            {/* Metric Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-brand">
                                <card.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${card.trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {card.change}
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{card.label}</p>
                        <p className="text-3xl font-black text-gray-900">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm min-h-[400px] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Besøkstrafikk (30 dager)</h2>
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                            <button className="px-4 py-2 text-xs font-bold text-brand bg-white rounded-lg shadow-sm">Uke</button>
                            <button className="px-4 py-2 text-xs font-bold text-gray-400">Måned</button>
                        </div>
                    </div>

                    {/* Visual representation of a chart using divs */}
                    <div className="flex items-end justify-between h-48 gap-2 px-4">
                        {[40, 60, 45, 80, 55, 90, 70, 85, 50, 65, 45, 75, 95, 60].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 1 }}
                                className="flex-1 bg-brand rounded-t-lg opacity-10 min-w-[10px] relative group"
                            >
                                <div className="absolute inset-0 bg-brand opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                            </motion.div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest px-2">
                        <span>01. Okt</span>
                        <span>15. Okt</span>
                        <span>30. Okt</span>
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm flex flex-col">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight mb-10">Enheter</h2>

                    <div className="space-y-8 flex-grow">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <div className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Mobil</div>
                                <span className="text-gray-900">72%</span>
                            </div>
                            <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '72%' }}
                                    transition={{ duration: 1.5, ease: "circOut" }}
                                    className="h-full bg-brand"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Desktop</div>
                                <span className="text-gray-900">24%</span>
                            </div>
                            <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '24%' }}
                                    transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                    className="h-full bg-brand opacity-60"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                                <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> Tablet</div>
                                <span className="text-gray-900">4%</span>
                            </div>
                            <div className="h-3 bg-gray-50 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '4%' }}
                                    transition={{ duration: 1.5, ease: "circOut", delay: 0.4 }}
                                    className="h-full bg-brand opacity-30"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                        <p className="text-xs font-bold text-gray-500 leading-relaxed text-center italic">
                            "Bruken av mobil fortsetter å øke. Sørg for at innholdet er optimalisert for små skjermer."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
