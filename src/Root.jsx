import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SiteProvider } from '@/contexts/SiteContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ContentProvider } from '@/contexts/ContentContext';
import App from './App';

const Root = () => {
    return (
        <SiteProvider>
            <AuthProvider>
                <ContentProvider>
                    <Router>
                        <App />
                    </Router>
                </ContentProvider>
            </AuthProvider>
        </SiteProvider>
    );
};

export default Root;
