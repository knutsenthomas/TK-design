import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Upload,
    Trash2,
    Search,
    Loader2,
    CheckCircle,
    AlertCircle,
    X,
    FileImage,
    ExternalLink,
    Copy
} from 'lucide-react';

const MediaManager = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [notice, setNotice] = useState(null);

    // Unsplash State
    const [activeTab, setActiveTab] = useState('library'); // 'library' or 'unsplash'
    const [unsplashQuery, setUnsplashQuery] = useState('');
    const [unsplashResults, setUnsplashResults] = useState([]);
    const [unsplashLoading, setUnsplashLoading] = useState(false);

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        try {
            const response = await fetch('/api/media');
            if (response.ok) {
                const data = await response.json();
                setMedia(data);
            }
        } catch (error) {
            console.error('Failed to fetch media:', error);
        } finally {
            setLoading(false);
        }
    };

    const searchUnsplash = async (e) => {
        if (e) e.preventDefault();
        if (!unsplashQuery.trim()) return;

        setUnsplashLoading(true);
        try {
            const response = await fetch(`/api/unsplash/search?query=${encodeURIComponent(unsplashQuery)}`);
            if (response.ok) {
                const data = await response.json();
                setUnsplashResults(data.results || []);
            } else {
                const errorData = await response.json();
                console.error('Unsplash error:', errorData);
                setNotice({ type: 'error', message: 'Unsplash-søk feilet. Sjekk API-nøkkel.' });
                setTimeout(() => setNotice(null), 5000);
            }
        } catch (error) {
            console.error('Unsplash fetch error:', error);
            setNotice({ type: 'error', message: 'Kunne ikke kontakte Unsplash-tjenesten.' });
            setTimeout(() => setNotice(null), 5000);
        } finally {
            setUnsplashLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            setNotice({ type: 'success', message: 'Bilde er lastet opp!' });
            fetchMedia();
            setTimeout(() => setNotice(null), 3000);
        } catch (error) {
            console.error('Upload error:', error);
            setNotice({ type: 'error', message: 'Opplasting feilet.' });
            setTimeout(() => setNotice(null), 3000);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (filename) => {
        if (!window.confirm('Er du sikker på at du vil slette dette bildet?')) return;
        try {
            const response = await fetch(`/api/media/${filename}`, { method: 'DELETE' });
            if (response.ok) {
                fetchMedia();
                setSelectedImage(null);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredMedia = media.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-3xl font-extrabold text-gray-900">Mediebibliotek</h1>
                    <p className="text-gray-500 mt-1 font-medium">Administrer alle bildene dine på ett sted</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex p-1 bg-gray-100 rounded-2xl">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'library' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Bibliotek
                        </button>
                        <button
                            onClick={() => setActiveTab('unsplash')}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'unsplash' ? 'bg-white shadow-sm text-brand' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Unsplash
                        </button>
                    </div>
                    <label className="flex items-center gap-2 px-8 py-4 bg-brand text-white rounded-2xl font-bold cursor-pointer active:scale-[0.98] transition-all shadow-lg shadow-brand/10 hover:bg-brand-dark">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Last opp</>}
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                    </label>
                </div>
            </header>

            {/* Main Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    {activeTab === 'library' ? (
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Søk i filnavn..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-brand/20 bg-white outline-none transition-all text-sm font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    ) : (
                        <form onSubmit={searchUnsplash} className="relative w-full max-w-md flex gap-2">
                            <div className="relative flex-grow">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Søk på Unsplash (f.eks. 'office', 'nature')..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-transparent focus:border-brand/20 bg-white outline-none transition-all text-sm font-medium"
                                    value={unsplashQuery}
                                    onChange={(e) => setUnsplashQuery(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={unsplashLoading}
                                className="px-6 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all disabled:opacity-50"
                            >
                                {unsplashLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Søk'}
                            </button>
                        </form>
                    )}

                    {notice && (
                        <div className={`text-xs font-bold uppercase tracking-widest px-4 flex items-center gap-2 ${notice.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {notice.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {notice.message}
                        </div>
                    )}
                </div>

                {/* Grid */}
                <div className="flex-grow p-8">
                    {activeTab === 'library' ? (
                        filteredMedia.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <FileImage className="w-16 h-16" />
                                <p className="font-bold">Ingen bilder funnet i biblioteket</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {filteredMedia.map((item) => (
                                    <motion.div
                                        layoutId={item.name}
                                        key={item.name}
                                        onClick={() => setSelectedImage(item)}
                                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-100 bg-gray-50"
                                    >
                                        <img src={item.url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        unsplashResults.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                                <ImageIcon className="w-16 h-16" />
                                <p className="font-bold">{unsplashLoading ? 'Søker på Unsplash...' : 'Søk for å finne bilder på Unsplash'}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                {unsplashResults.map((img) => (
                                    <motion.div
                                        key={img.id}
                                        onClick={() => setSelectedImage({
                                            name: img.alt_description || 'Unsplash Image',
                                            url: img.urls.regular,
                                            size: 0,
                                            isUnsplash: true,
                                            attribution: `Photo by ${img.user.name} on Unsplash`
                                        })}
                                        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-100 bg-gray-50"
                                    >
                                        <img src={img.urls.small} alt={img.alt_description} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <p className="text-[8px] text-white font-bold truncate">av {img.user.name}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Detail Overlay */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col"
                        >
                            <header className="h-20 border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
                                <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{selectedImage.name}</h2>
                                <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </header>

                            <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50">
                                    <img src={selectedImage.url} alt="" className="w-full h-full object-contain" />
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Fil-URL</label>
                                            <div className="flex gap-2">
                                                <input
                                                    readOnly
                                                    type="text"
                                                    value={selectedImage.url}
                                                    className="w-full bg-white px-4 py-2 rounded-xl text-xs font-medium text-gray-500 border border-gray-100"
                                                />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedImage.url);
                                                        setNotice({ type: 'success', message: 'Kopiert til utklippstavle' });
                                                        setTimeout(() => setNotice(null), 3000);
                                                    }}
                                                    className="p-2 bg-white rounded-xl border border-gray-100 text-brand"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        {selectedImage.attribution && (
                                            <p className="text-[10px] font-bold text-gray-400 italic">{selectedImage.attribution}</p>
                                        )}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Størrelse</label>
                                                <p className="text-sm font-bold text-gray-700">{selectedImage.isUnsplash ? 'Ekstern' : `${Math.round(selectedImage.size / 1024)} KB`}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Kilde</label>
                                                <p className="text-sm font-bold text-gray-700">{selectedImage.isUnsplash ? 'Unsplash' : 'Lokalt'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <a
                                            href={selectedImage.url}
                                            target="_blank"
                                            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-brand text-brand rounded-2xl font-bold hover:bg-brand hover:text-white transition-all active:scale-[0.98]"
                                        >
                                            <ExternalLink className="w-5 h-5" /> Se full størrelse
                                        </a>
                                        {!selectedImage.isUnsplash && (
                                            <button
                                                onClick={() => handleDelete(selectedImage.name)}
                                                className="w-full flex items-center justify-center gap-2 py-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" /> Slett bilde permanent
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MediaManager;
