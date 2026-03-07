import React from 'react';
import { motion } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { MoveRight, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import Marquee from '@/components/Marquee';

const Home = () => {
    const { t } = useSite();

    const services = [
        { id: 's1', cat: t('services.s1_cat'), title: t('services.s1_title'), desc: t('services.s1_desc') },
        { id: 's2', cat: t('services.s2_cat'), title: t('services.s2_title'), desc: t('services.s2_desc') },
        { id: 's3', cat: t('services.s3_cat'), title: t('services.s3_title'), desc: t('services.s3_desc') },
        { id: 's4', cat: t('services.s4_cat'), title: t('services.s4_title'), desc: t('services.s4_desc') },
    ];

    const projects = [
        { id: 'p1', title: t('projects.p1_title'), desc: t('projects.p1_desc'), img: '/img/projects/kudos.png' },
        { id: 'p2', title: t('projects.p2_title'), desc: t('projects.p2_desc'), img: '/img/projects/hkm.png' },
        { id: 'p7', title: t('projects.p7_title'), desc: t('projects.p7_desc'), img: '/img/projects/mandal.png' },
    ];

    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center bg-[#F9FAFB] px-6 pt-20">
                <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-block py-1 px-4 rounded-full bg-blue-50 text-[#1B4965] text-sm font-semibold mb-6">
                            {t('hero.subtitle')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-8">
                            {t('hero.title_1_line1')} <br />
                            <span className="text-[#1B4965]">{t('hero.title_1_line2')}</span> <br />
                            {t('hero.title_2')}
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
                            {t('hero.description')}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-[#1B4965] text-white rounded-xl font-bold hover:bg-[#14374d] transition-all flex items-center gap-2 group active:scale-[0.98]">
                                {t('hero.cta_primary')}
                                <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]">
                                {t('hero.work_process')}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="hidden md:block relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-white p-4">
                            <img
                                src="/img/hero/mockup.png"
                                alt="Digital Partner"
                                className="w-full h-auto rounded-lg"
                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015'}
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-50 z-20 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#1B4965]">
                                <CheckCircle2 />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('hero.spotlight_label')}</p>
                                <p className="text-sm font-bold text-gray-900">{t('hero.spotlight_value')}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Marquee */}
            <Marquee
                words={[
                    t('marquee.top_1'),
                    t('marquee.top_2'),
                    t('marquee.top_3'),
                    t('marquee.top_4')
                ]}
            />

            {/* Services Section */}
            <section className="py-32 bg-white px-6">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div className="max-w-2xl">
                            <span className="text-[#1B4965] font-bold uppercase tracking-widest text-sm mb-4 block">
                                {t('services.title')}
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                                Vi bygger løsninger som <span className="text-[#1B4965]">funker</span>
                            </h2>
                        </div>
                        <button className="text-[#1B4965] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                            Se alle tjenester <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, idx) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 rounded-3xl border border-gray-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group bg-[#F9FAFB]/50"
                            >
                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#1B4965] mb-8 group-hover:bg-[#1B4965] group-hover:text-white transition-colors">
                                    <Star className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    {service.cat}
                                </span>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                    {service.desc}
                                </p>
                                <Link to="/services" className="text-sm font-bold text-[#1B4965] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Les mer <ChevronRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section className="py-32 bg-[#F9FAFB] px-6">
                <div className="container mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-[#1B4965] font-bold uppercase tracking-widest text-sm mb-4 block">
                            {t('projects.subtitle')}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            {t('projects.title')}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {projects.map((project, idx) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 shadow-lg">
                                    <img
                                        src={project.img}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">{project.desc}</p>
                                        <h4 className="text-white text-2xl font-bold">{project.title}</h4>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-[#1B4965] transition-colors">{project.title}</h4>
                                <p className="text-gray-500 text-sm font-medium">{project.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-32 px-6">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#1B4965] rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-6xl font-bold mb-8">Klar for å starte ditt <br /> neste prosjekt?</h2>
                            <p className="text-blue-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-80">
                                La oss ta en prat om hvordan vi kan hjelpe deg med å bli mer synlig og profesjonell på nett.
                            </p>
                            <button className="px-10 py-5 bg-white text-[#1B4965] rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl shadow-black/10 active:scale-[0.98]">
                                Kontakt oss i dag
                            </button>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

// Internal Link wrapper since I'm using local Link
import { Link } from 'react-router-dom';

export default Home;
