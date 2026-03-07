import React from 'react';
import { motion } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { Users, Target, Rocket, Shield } from 'lucide-react';

const About = () => {
    const { t } = useSite();

    const values = [
        { icon: <Target className="w-6 h-6" />, title: t('about.tabs.education'), desc: t('about.education_tab.university') },
        { icon: <Users className="w-6 h-6" />, title: t('about.tabs.experience'), desc: 'Et lite og smidig team med tverrfaglig kompetanse.' },
        { icon: <Shield className="w-6 h-6" />, title: t('about.tabs.skills'), desc: 'Kvalitet og trygghet i hver leveranse.' },
        { icon: <Rocket className="w-6 h-6" />, title: 'Vår visjon', desc: 'Å være den foretrukne partneren for digital vekst.' },
    ];

    return (
        <div className="pt-32 pb-20 px-6">
            <div className="container mx-auto">
                {/* Intro Section */}
                <section className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block">
                            {t('about.tabs.about')}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                            {t('about.about_tab.based_title')}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                            {t('about.intro')}
                        </p>
                        <p className="text-lg text-gray-500 leading-relaxed">
                            {t('about.about_tab.based_desc')}
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                            <img
                                src="/img/about/team.png"
                                alt="TK-design Team"
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070'}
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-brand text-white p-8 rounded-3xl shadow-xl hidden md:block">
                            <p className="text-4xl font-bold mb-1">100%</p>
                            <p className="text-blue-100 text-sm font-medium">Dedisert oppfølging</p>
                        </div>
                    </motion.div>
                </section>

                {/* Values Grid */}
                <section className="bg-gray-50 rounded-[4rem] p-12 md:p-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Hva vi står for</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Våre kjerneverdier definerer hvordan vi jobber og hva du kan forvente av oss.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-brand mb-6">
                                    {v.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{v.title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Team Section */}
                <section className="py-32">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Menneskene bak</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">{t('about.about_tab.exp_title')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                        <div className="text-center">
                            <div className="aspect-square rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg max-w-[240px] mx-auto">
                                <img src="/img/team/thomas.png" alt="Thomas" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Thomas'} />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900">{t('about.experience_tab.senior_role')}</h4>
                            <p className="text-brand font-medium">Senior Utvikler & Daglig leder</p>
                        </div>
                        <div className="text-center">
                            <div className="aspect-square rounded-full overflow-hidden mb-8 border-4 border-white shadow-lg max-w-[240px] mx-auto">
                                <img src="/img/team/hilde.png" alt="Hilde" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hilde'} />
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900">{t('about.experience_tab.junior_role')}</h4>
                            <p className="text-brand font-medium">Innhold & Strategi</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
