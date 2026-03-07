import React from 'react';
import { motion } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { ExternalLink } from 'lucide-react';

const Portfolio = () => {
    const { t } = useSite();

    const projects = [
        { id: 'p1', title: t('projects.p1_title'), desc: t('projects.p1_desc'), img: '/img/projects/kudos.png', cat: 'Regnskap' },
        { id: 'p2', title: t('projects.p2_title'), desc: t('projects.p2_desc'), img: '/img/projects/hkm.png', cat: 'Organisasjon' },
        { id: 'p7', title: t('projects.p7_title'), desc: t('projects.p7_desc'), img: '/img/projects/mandal.png', cat: 'Regnskap' },
        { id: 'p3', title: t('projects.p3_title'), desc: t('projects.p3_desc'), img: '/img/projects/3.png', cat: 'Webdesign' },
        { id: 'p4', title: t('projects.p4_title'), desc: t('projects.p4_desc'), img: '/img/projects/4.png', cat: 'SEO' },
        { id: 'p5', title: t('projects.p5_title'), desc: t('projects.p5_desc'), img: '/img/projects/5.png', cat: 'SoMe' },
    ];

    return (
        <div className="pt-32 pb-20 bg-white px-6">
            <div className="container mx-auto">
                <div className="max-w-3xl mb-20">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block">
                        {t('projects.subtitle')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                        Vårt arbeid og <span className="text-brand">prosjekter</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                        Se et utvalg av våre siste leveranser innen webdesign, SEO og digital strategi. Vi brenner for å skape unike løsninger som gir faktiske resultater.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {projects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group"
                        >
                            <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-md border border-gray-100">
                                <img
                                    src={project.img}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2015'}
                                />
                                <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand shadow-xl scale-0 group-hover:scale-100 transition-transform duration-300">
                                        <ExternalLink className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">{project.cat}</span>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand transition-colors">{project.title}</h3>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
