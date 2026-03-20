import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Shield,
  Gauge as GaugeIcon,
  Search as SearchIcon,
  ChevronRight,
  Mail,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const Gauge = ({ score, label, color }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-100"
          />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-2xl font-black text-[#1B4965] group-hover:scale-110 transition-transform">
          {score}
        </span>
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">{label}</span>
    </div>
  );
};

const MetricCard = ({ label, value, description, status }) => {
  const getStatusColor = () => {
    if (status === 'success') return 'text-green-600 bg-green-50 border-green-100';
    if (status === 'warning') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className={`p-5 rounded-2xl border ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-sm uppercase tracking-tight opacity-80">{label}</h4>
        <span className="font-black text-xl">{value}</span>
      </div>
      <p className="text-sm font-medium leading-relaxed text-gray-700">{description}</p>
    </div>
  );
};

const Header = () => (
  <header className="header" style={{ position: 'relative', background: '#fff', borderBottom: '1px solid #E5E7EB' }}>
    <div className="container nav-container">
      <a href="/" className="logo" aria-label="tk-design">
        <span className="logo-icon">
          <img src="/img/logo/d.webp" alt="tk-design logo" />
        </span>
        <span className="logo-text">tk-design</span>
      </a>
      <nav className="nav-desktop">
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/?section=about">About</a></li>
          <li><a href="/?section=services">Services</a></li>
          <li><a href="/?section=projects">Portfolio</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </nav>
      <div className="lang-switch-desktop" style={{ display: 'flex', gap: '5px' }}>
        <button className="lang-btn">EN</button>
        <button className="lang-btn active">NO</button>
      </div>
    </div>
  </header>
);

const Footer = () => (
  <footer className="footer pt_120 pb_120" style={{ borderTop: '1px solid #E5E7EB', marginTop: 'auto', background: '#fff' }}>
    <div className="container">
      <div className="footer-content">
        <div className="footer-info">
          <p style={{ fontSize: '20px', color: '#1B4965', marginBottom: '20px' }}>
            Vi bygger din digitale identitet med skreddersydd webdesign, SEO og SoMe-strategi.
          </p>
          <a href="mailto:thomas@tk-design.no" style={{ fontSize: '30px', textDecoration: 'underline', color: '#1B4965' }}>
            thomas@tk-design.no
          </a>
        </div>
        <div className="footer-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
          <a href="#" className="social-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1B4965' }}>Facebook <ArrowRight size={16} /></a>
          <a href="#" className="social-link" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#1B4965' }}>Instagram <ArrowRight size={16} /></a>
        </div>
      </div>
      <div className="flex flex-wrap justify-between items-center" style={{ borderTop: '1px solid #E5E7EB', paddingTop: '30px', marginTop: '40px' }}>
        <p>Copyright © 2026 <a href="/" style={{ color: '#1B4965' }}>TK-design</a> All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/privacy" style={{ color: '#1B4965', textDecoration: 'none' }}>Privacy Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [strategy, setStrategy] = useState('mobile'); // 'mobile' | 'desktop'
  const [error, setError] = useState(null);

  const testSite = async (e) => {
    e?.preventDefault();
    if (!url) return;
    
    // Simple URL validation
    let testUrl = url.trim();
    if (!testUrl.startsWith('http')) testUrl = 'https://' + testUrl;
    
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_PAGESPEED_API_KEY || '';
      const apiEndpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo${apiKey ? `&key=${apiKey}` : ''}`;
      
      const response = await fetch(apiEndpoint);
      const data = await response.json();

      if (data.error) throw new Error(data.error.message);

      const lighthouse = data.lighthouseResult;
      const audits = lighthouse.audits;

      setResults({
        scores: {
          performance: Math.round(lighthouse.categories.performance.score * 100),
          accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
          bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
          seo: Math.round(lighthouse.categories.seo.score * 100),
        },
        metrics: [
          {
            label: "Sidetilkobling",
            value: audits['first-contentful-paint'].displayValue,
            description: "Hvor raskt det første bildet eller teksten dukker opp.",
            status: audits['first-contentful-paint'].score >= 0.9 ? 'success' : audits['first-contentful-paint'].score >= 0.5 ? 'warning' : 'error'
          },
          {
            label: "Ferdiglastet",
            value: audits['largest-contentful-paint'].displayValue,
            description: "Hvor lang tid det tar før siden føles helt klar.",
            status: audits['largest-contentful-paint'].score >= 0.9 ? 'success' : audits['largest-contentful-paint'].score >= 0.5 ? 'warning' : 'error'
          },
          {
            label: "Interaktivitet",
            value: audits['total-blocking-time'].displayValue,
            description: "Hvor responsiv siden er når du trykker på ting.",
            status: audits['total-blocking-time'].score >= 0.9 ? 'success' : audits['total-blocking-time'].score >= 0.5 ? 'warning' : 'error'
          },
          {
            label: "Visuell stabilitet",
            value: audits['cumulative-layout-shift'].displayValue,
            description: "Hvor mye ting 'hopper rundt' under lasting.",
            status: audits['cumulative-layout-shift'].score >= 0.9 ? 'success' : audits['cumulative-layout-shift'].score >= 0.5 ? 'warning' : 'error'
          }
        ],
        topFixes: [
          "Optimaliser bildestørrelser og bruk WebP",
          "Fjern ubrukt JavaScript og CSS",
          "Sett riktige størrelser på layout-elementer"
        ]
      });
    } catch (err) {
      setError("Kunne ikke analysere nettstedet. Sjekk at URL-en er riktig.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6"
          >
            <Shield size={16} className="text-[#1B4965]" />
            <span className="text-sm font-bold text-[#1B4965] uppercase tracking-wider">Drevet av Google Lighthouse API v5</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-black text-[#1B4965] mb-8 leading-[1.1]">
            Er nettsiden din <br />
            <span className="text-[#62B6CB]">rask nok for kundene?</span>
          </h1>
          
          <p className="text-xl text-[#4B5563] mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Dårlig hastighet skremmer bort besøkende og skader din rangering i Google.
            Test siden din nå og få en konkret handlingsplan.
          </p>

          <form onSubmit={testSite} className="relative max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 p-2 bg-white rounded-3xl shadow-2xl border border-gray-100">
              <div className="flex-grow flex items-center px-4 gap-3">
                <SearchIcon className="text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Lim inn URL her (f.eks. tk-design.no)"
                  className="w-full py-4 text-lg font-medium outline-none text-[#1B4965] bg-transparent"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setStrategy('mobile')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold ${strategy === 'mobile' ? 'bg-white shadow-sm text-[#1B4965]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Smartphone size={18} />
                  <span>Mobil</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStrategy('desktop')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold ${strategy === 'desktop' ? 'bg-white shadow-sm text-[#1B4965]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Monitor size={18} />
                  <span>Desktop</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#1B4965] text-white font-black px-8 py-4 rounded-2xl hover:bg-[#1B4965]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={20} />
                    <span>Test min side</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 mb-8"
            >
              <AlertCircle size={20} />
              <p className="font-bold">{error}</p>
            </motion.div>
          )}

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto space-y-12 pb-24"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white p-10 rounded-[40px] shadow-xl border border-gray-100">
                <Gauge score={results.scores.performance} label="Ytelse" color={getScoreColor(results.scores.performance)} />
                <Gauge score={results.scores.accessibility} label="Tilgjengelighet" color={getScoreColor(results.scores.accessibility)} />
                <Gauge score={results.scores.bestPractices} label="Praksis" color={getScoreColor(results.scores.bestPractices)} />
                <Gauge score={results.scores.seo} label="SEO" color={getScoreColor(results.scores.seo)} />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.metrics.map((metric, i) => (
                  <MetricCard key={i} {...metric} />
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-[#1B4965] text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-8 flex items-center gap-3">
                      <Zap className="text-[#62B6CB]" />
                      Din handlingsplan
                    </h3>
                    <ul className="space-y-4">
                      {results.topFixes.map((fix, i) => (
                        <li key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10 group-hover:translate-x-2 transition-transform">
                          <CheckCircle2 className="text-[#62B6CB]" size={20} />
                          <span className="font-bold">{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#62B6CB] opacity-10 blur-3xl -mr-32 -mt-32" />
                </div>

                <div className="bg-white p-10 rounded-[40px] shadow-xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-black text-[#1B4965] mb-4">Vil du ha full rapport?</h3>
                    <p className="text-lg text-[#4B5563] mb-8 font-medium leading-relaxed">
                      Legg igjen e-posten din, så sender vi deg en detaljert analyse og tips til hvordan du kan forbedre resultatene dine.
                    </p>
                    <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="flex-grow flex items-center px-4 gap-3">
                        <Mail className="text-gray-400" size={18} />
                        <input type="email" placeholder="Din e-post" className="bg-transparent outline-none w-full font-bold text-[#1B4965]" />
                      </div>
                      <button className="bg-[#1B4965] text-white font-black px-6 py-3 rounded-xl whitespace-nowrap">Send meg</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
