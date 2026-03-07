import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSite } from '@/contexts/SiteContext';
import { posts } from '@/lib/posts';
import { Calendar, User, ArrowLeft, ChevronRight } from 'lucide-react';

const BlogDetails = () => {
    const { id } = useParams();
    const { t } = useSite();
    const navigate = useNavigate();
    const post = posts.find(p => p.id === parseInt(id));

    if (!post) {
        return (
            <div className="pt-40 pb-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Innlegget ble ikke funnet</h1>
                <button onClick={() => navigate('/blog')} className="text-brand font-bold underline">Tilbake til oversikten</button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-4xl">
                <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-brand transition-colors mb-12 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    {t('blog_details.back_to_blog')}
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="px-4 py-1 bg-blue-50 text-brand text-xs font-bold rounded-full uppercase tracking-widest mb-6 inline-block">
                        {post.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-8 text-sm text-gray-400 font-bold uppercase tracking-widest mb-12 border-b border-gray-100 pb-8">
                        <div className="flex items-center gap-2 pt-1 border-t-2 border-brand"><Calendar className="w-4 h-4" /> {post.date}</div>
                        <div className="flex items-center gap-2 pt-1 border-t-2 border-transparent"><User className="w-4 h-4" /> {post.author}</div>
                    </div>

                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-16">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070'}
                        />
                    </div>

                    <article
                        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-brand prose-strong:text-gray-900"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-20 p-10 bg-gray-50 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-md">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-display">Vil du vite mer?</h3>
                            <p className="text-gray-500">Vi kan hjelpe deg med å omsette denne kunnskapen til faktiske resultater for din bedrift.</p>
                        </div>
                        <Link to="/contact" className="px-8 py-4 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all flex items-center gap-2 group whitespace-nowrap">
                            Start en samtale
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BlogDetails;
