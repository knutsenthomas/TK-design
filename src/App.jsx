import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Contact from '@/pages/Contact';
import Portfolio from '@/pages/Portfolio';
import About from '@/pages/About';
import Blog from '@/pages/Blog';
import BlogDetails from '@/pages/BlogDetails';
import Privacy from '@/pages/Privacy';
import Accessibility from '@/pages/Accessibility';

// Admin Imports
import Login from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import ContentEditor from '@/pages/admin/ContentEditor';
import BlogManager from '@/pages/admin/BlogManager';
import SeoManager from '@/pages/admin/SeoManager';
import MediaManager from '@/pages/admin/MediaManager';
import Messages from '@/pages/admin/Messages';
import Analytics from '@/pages/admin/Analytics';
import DesignManager from '@/pages/admin/DesignManager';

import AdminLayout from '@/components/admin/AdminLayout';
import ProtectedRoute from '@/components/admin/ProtectedRoute';

// Placeholder common layout for public pages
const PublicLayout = ({ children }) => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
            {children}
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
            <Route path="/portfolio" element={<PublicLayout><Portfolio /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:id" element={<PublicLayout><BlogDetails /></PublicLayout>} />
            <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
            <Route path="/accessibility" element={<PublicLayout><Accessibility /></PublicLayout>} />

            {/* Admin Login */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/content" element={<ContentEditor />} />
                    <Route path="/admin/blog" element={<BlogManager />} />
                    <Route path="/admin/design" element={<DesignManager />} />
                    <Route path="/admin/seo" element={<SeoManager />} />
                    <Route path="/admin/media" element={<MediaManager />} />
                    <Route path="/admin/messages" element={<Messages />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
