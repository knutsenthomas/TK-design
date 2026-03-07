import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Trash2,
    Archive,
    Search,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    User,
    Clock,
    MessageSquare,
    Reply
} from 'lucide-react';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await fetch('/api/messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Er du sikker på at du vil slette denne meldingen?')) return;
        try {
            const response = await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchMessages();
                setSelectedMessage(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-extrabold text-gray-900">Meldingssenter</h1>
                <p className="text-gray-500 mt-1 font-medium">Håndter henvendelser fra kontaktskjemaet</p>
            </header>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Søk i navn, e-post eller emne..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-brand/20 bg-white outline-none transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
                        {filteredMessages.length} meldinger
                    </div>
                </div>

                <div className="flex-grow overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 uppercase text-[10px] font-black tracking-[0.2em] text-gray-400">
                                <th className="px-8 py-6">Avsender</th>
                                <th className="px-8 py-6">Emne</th>
                                <th className="px-8 py-6">Dato</th>
                                <th className="px-8 py-6 text-right">Handlinger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMessages.map((msg) => (
                                <tr
                                    key={msg.id}
                                    onClick={() => setSelectedMessage(msg)}
                                    className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${msg.read ? 'bg-gray-200' : 'bg-brand'}`}>
                                                {msg.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${msg.read ? 'text-gray-500' : 'text-gray-900'}`}>{msg.name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{msg.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className={`text-sm font-bold line-clamp-1 ${msg.read ? 'text-gray-400' : 'text-brand'}`}>
                                            {msg.subject || 'Ingen emne'}
                                        </p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(msg.timestamp).toLocaleDateString('no-NO')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                                                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Message Overlay */}
            <AnimatePresence>
                {selectedMessage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedMessage(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col"
                        >
                            <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3 text-brand">
                                    <Mail className="w-5 h-5" />
                                    <span className="font-bold">Melding Detaljer</span>
                                </div>
                                <button onClick={() => setSelectedMessage(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </header>

                            <div className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 bg-brand/5 rounded-3xl flex items-center justify-center text-brand text-2xl font-black">
                                            {selectedMessage.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{selectedMessage.name}</h2>
                                            <p className="text-brand font-bold">{selectedMessage.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">{new Date(selectedMessage.timestamp).toLocaleString('no-NO')}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-3">
                                            <MessageSquare className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs font-bold text-gray-600">Direkte kontakt</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Melding</label>
                                    <div className="p-8 bg-gray-50 rounded-[2rem] text-gray-700 font-medium leading-relaxed border border-gray-100">
                                        <p className="mb-4 font-black text-brand text-lg">{selectedMessage.subject || 'Ingen emne'}</p>
                                        {selectedMessage.message}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <a
                                        href={`mailto:${selectedMessage.email}`}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/10 active:scale-[0.98]"
                                    >
                                        <Reply className="w-5 h-5" /> Svar på e-post
                                    </a>
                                    <button
                                        onClick={() => handleDelete(selectedMessage.id)}
                                        className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" /> Slett melding
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Messages;
