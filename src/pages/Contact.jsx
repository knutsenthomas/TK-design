import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { Send, CheckCircle, AlertCircle, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import Input from '@/components/Input';

const Contact = () => {
    const { t } = useSite();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/api/save-contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to send');

            setStatus('success');
            setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Contact error:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Kontaktinformasjon */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="space-y-12"
                        >
                            <div>
                                <h2 className="text-brand font-bold uppercase tracking-widest text-sm mb-4">
                                    {t('contact_kicker')}
                                </h2>
                                <h1 className="text-4xl md:text-6xl font-extrabold text-[#0f172a] leading-tight">
                                    {t('contact_title')}
                                </h1>
                                <p className="mt-6 text-lg text-gray-500 max-w-md leading-relaxed">
                                    {t('contact_desc')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand shadow-sm">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Telefon</h3>
                                        <p className="text-lg font-bold text-[#0f172a]">+47 483 31 161</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand shadow-sm">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">E-post</h3>
                                        <p className="text-lg font-bold text-[#0f172a]">thomas@tk-design.no</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-gray-50 border border-gray-100">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand shadow-sm">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Lokasjon</h3>
                                        <p className="text-lg font-bold text-[#0f172a]">Mandal, Norge</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Kontaktskjema */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl border border-gray-100">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Navn" name="name" required value={formData.name} onChange={handleChange} />
                                        <Input label="E-post" name="email" type="email" required value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Telefon" name="phone" value={formData.phone} onChange={handleChange} />
                                        <Input label="Bedrift" name="company" value={formData.company} onChange={handleChange} />
                                    </div>
                                    <Input label="Emne" name="subject" value={formData.subject} onChange={handleChange} />

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 block ml-1 uppercase tracking-wider">Melding</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows="5"
                                            className="w-full px-6 py-4 rounded-3xl bg-gray-50 border border-transparent focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/5 outline-none transition-all resize-none text-gray-700"
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-5 bg-brand text-white rounded-full font-bold text-lg hover:bg-brand-dark transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-brand/20 disabled:opacity-70"
                                    >
                                        {status === 'loading' ? (
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span>{t('contact_submit')}</span>
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-x-10 bottom-10 p-4 bg-green-50 border border-green-100 text-green-700 rounded-2xl flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-bold">Melding sendt! Vi kontakter deg snart.</span>
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-x-10 bottom-10 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center justify-center gap-3"
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-bold">Noe gikk galt. Prøv igjen senere.</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
