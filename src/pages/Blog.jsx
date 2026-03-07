import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSite } from '@/contexts/SiteContext';
import { posts } from '@/lib/posts';
import { Calendar, User, ArrowRight } from 'lucide-react';

const Blog = () => {
    const { t } = useSite();

    return (
        <div className="pt-32 pb-20 px-6">
            <div className="container mx-auto">
                <div className="max-w-3xl mb-20">
                    <span className="text-brand font-bold uppercase tracking-widest text-sm mb-4 block">
                        {t('blog.subtitle')}
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                        Aktuelt fra <span className="text-brand">TK-design</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
                        Tips, triks og innsikt om webdesign, SEO og digital synlighet. Vi deler vår kunnskap for å hjelpe deg å vokse.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {posts.map((post, idx) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all"
                        >
                            <Link to={`/blog/${post.id}`} className="block relative aspect-video overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070'}
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-brand uppercase tracking-wider">
                                        {post.category}
                                    </span>
                                </div>
                            </Link>

                            <div className="p-8">
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-brand transition-colors line-clamp-2">
                                    {post.title}
                                </h3>
                                <Link
                                    to={`/blog/${post.id}`}
                                    className="inline-flex items-center gap-2 text-brand font-bold text-sm group/btn"
                                >
                                    Les mer <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
