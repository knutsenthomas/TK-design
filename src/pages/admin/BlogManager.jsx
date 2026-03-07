import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PenNib,
    Plus,
    Search,
    Trash2,
    Edit3,
    Calendar,
    User,
    Image as ImageIcon,
    Save,
    X,
    Loader2,
    CheckCircle,
    AlertCircle,
    ChevronRight
} from 'lucide-react';

const BlogManager = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts');
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus('idle');
        try {
            const isNew = !editingPost.id || !posts.find(p => p.id === editingPost.id);
            const url = isNew ? '/api/posts' : `/api/posts/${editingPost.id}`;
            const method = isNew ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPost)
            });

            if (!response.ok) throw new Error('Failed to save');

            setSaveStatus('success');
            setEditingPost(null);
            fetchPosts();
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('Save error:', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Er du sikker på at du vil slette dette innlegget?')) return;
        try {
            const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchPosts();
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Blogghåndtering</h1>
                    <p className="text-gray-500 mt-1 font-medium">Lag og rediger artikler for Aktuelt-siden</p>
                </div>
                <button
                    onClick={() => setEditingPost({
                        title: '',
                        author: 'Thomas Knutsen',
                        category: 'Webdesign',
                        date: new Date().toLocaleDateString('no-NO'),
                        image: '',
                        content: '',
                        seoTitle: '',
                        seoDesc: '',
                        seoKeywords: ''
                    })}
                    className="flex items-center gap-2 px-6 py-4 bg-brand text-white rounded-2xl font-bold active:scale-[0.98] transition-all shadow-lg shadow-brand/10"
                >
                    <Plus className="w-5 h-5" /> Nytt innlegg
                </button>
            </header>

            {/* List View */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Søk i titler eller kategorier..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-brand/20 bg-white outline-none transition-all text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
                        {filteredPosts.length} innlegg totalt
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50 uppercase text-[10px] font-black tracking-[0.2em] text-gray-400">
                                <th className="px-8 py-6">Innlegg</th>
                                <th className="px-8 py-6">Kategori</th>
                                <th className="px-8 py-6">Dato</th>
                                <th className="px-8 py-6 text-right">Handlinger</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="group hover:bg-gray-50/50 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                                                {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 m-3.5 text-gray-300" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 group-hover:text-brand transition-colors line-clamp-1">{post.title}</p>
                                                <p className="text-xs text-gray-400 font-medium">av {post.author}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-blue-50 text-brand rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100/50">
                                            {post.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-500">{post.date}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingPost(post)}
                                                className="p-3 hover:bg-white hover:shadow-md rounded-xl text-gray-400 hover:text-brand transition-all"
                                            >
                                                <Edit3 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="p-3 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Editor Modal Overlay */}
            <AnimatePresence>
                {editingPost && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingPost(null)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-3xl h-full bg-white shadow-2xl flex flex-col"
                        >
                            <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-50 text-brand rounded-xl flex items-center justify-center">
                                        <PenNib className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingPost.id ? 'Rediger innlegg' : 'Nytt innlegg'}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setEditingPost(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </header>

                            <form onSubmit={handleSave} className="flex-grow overflow-y-auto p-10 space-y-10 custom-scrollbar">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">Hovedinnhold</label>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Innleggstittel"
                                            className="w-full text-3xl font-black text-gray-900 border-none outline-none placeholder:text-gray-200"
                                            value={editingPost.title}
                                            onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                            required
                                        />
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex-1 min-w-[200px] p-4 bg-gray-50 rounded-2xl space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Kategori</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent font-bold text-gray-700 outline-none"
                                                    value={editingPost.category}
                                                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-[200px] p-4 bg-gray-50 rounded-2xl space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Forfatter</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-transparent font-bold text-gray-700 outline-none"
                                                    value={editingPost.author}
                                                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">Brødtekst</label>
                                    <div className="rounded-[2rem] overflow-hidden border border-gray-100 bg-gray-50 focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/5 transition-all">
                                        <ReactQuill
                                            theme="snow"
                                            value={editingPost.content}
                                            onChange={(content) => setEditingPost({ ...editingPost, content })}
                                            placeholder="Skriv ditt innhold her..."
                                            modules={{
                                                toolbar: [
                                                    [{ 'header': [1, 2, 3, false] }],
                                                    ['bold', 'italic', 'underline', 'strike'],
                                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                                    ['link', 'image', 'video'],
                                                    ['clean']
                                                ],
                                            }}
                                            className="quill-editor"
                                        />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-gray-50 space-y-6">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block ml-1">SEO & Synlighet</label>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SEO Tittel</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 font-bold text-gray-700 outline-none focus:border-brand/20 transition-all"
                                                    value={editingPost.seoTitle}
                                                    onChange={(e) => setEditingPost({ ...editingPost, seoTitle: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">SEO Beskrivelse</label>
                                                <textarea
                                                    rows="3"
                                                    className="w-full bg-white px-4 py-3 rounded-xl border border-gray-100 font-medium text-gray-700 outline-none focus:border-brand/20 transition-all resize-none"
                                                    value={editingPost.seoDesc}
                                                    onChange={(e) => setEditingPost({ ...editingPost, seoDesc: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <footer className="h-24 border-t border-gray-100 px-8 flex items-center justify-between bg-gray-50/50 shrink-0">
                                <div className="flex items-center gap-4">
                                    {saveStatus === 'success' && <div className="text-green-600 font-bold text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Lagret!</div>}
                                    {saveStatus === 'error' && <div className="text-red-600 font-bold text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Feil ved lagring</div>}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setEditingPost(null)}
                                        className="px-6 py-3 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Avbryt
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-8 py-3 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all shadow-lg shadow-brand/10 disabled:opacity-70 active:scale-[0.98]"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Lagre innlegg</>}
                                    </button>
                                </div>
                            </footer>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BlogManager;
