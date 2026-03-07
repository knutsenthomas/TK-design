import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Eye,
    Clock,
    Search,
    ArrowUpRight,
    FileText,
    Layers,
    MessageSquare,
    Globe
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/analytics');
                if (response.ok) {
                    const result = await response.json();
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Brukere (7d)', value: stats?.active7DayUsers || '0', icon: Users, color: 'blue' },
        { label: 'Sidevisninger (7d)', value: stats?.screenPageViews || '0', icon: Eye, color: 'orange' },
        { label: 'Aktive nå', value: stats?.activeUsers || '0', icon: Clock, color: 'green' },
        { label: 'Google Klikk (28d)', value: stats?.searchClicks || '9', icon: Search, color: 'purple' },
    ];

    const quickActions = [
        { label: 'Nytt blogginnlegg', icon: FileText, path: '/admin/blog' },
        { label: 'Rediger forside', icon: Layers, path: '/admin/content' },
        { label: 'Innboks', icon: MessageSquare, path: '/admin/messages' },
        { label: 'SEO Innstillinger', icon: Globe, path: '/admin/seo' },
    ];

    return (
        <div className="space-y-10">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900">Velkommen tilbake</h1>
                <p className="text-gray-500 mt-1 font-medium italic">Ett sted for å holde tk-design oppdatert</p>
            </header>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${card.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                                card.color === 'orange' ? 'bg-orange-50 text-brand' :
                                    card.color === 'green' ? 'bg-green-50 text-green-600' :
                                        'bg-purple-50 text-purple-600'
                            }`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{card.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{card.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 px-2">Hurtigvalg</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.label}
                                className="group p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-50 group-hover:bg-orange-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand transition-colors">
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-gray-700">{action.label}</span>
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-brand transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-brand rounded-[3rem] p-10 text-white shadow-2xl shadow-brand/20 flex flex-col justify-between min-h-[300px]">
                    <div>
                        <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Status</span>
                        <h2 className="text-3xl font-bold mt-4 leading-tight">Nettsiden din ser profesjonell ut.</h2>
                        <p className="mt-6 text-orange-200 font-medium leading-relaxed">
                            Alt innhold er synkronisert med Firebase. Husk å sjekke meldinger daglig for nye henvendelser.
                        </p>
                    </div>
                    <button
                        onClick={() => window.open('/', '_blank')}
                        className="mt-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        Se nettsted live <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
