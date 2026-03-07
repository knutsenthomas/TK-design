import React, { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext({});

export const ContentProvider = ({ children }) => {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('/api/content');
                if (response.ok) {
                    const data = await response.json();
                    setContent(data);
                }
            } catch (error) {
                console.error('Failed to load content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    return (
        <ContentContext.Provider value={{ content, loading }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => useContext(ContentContext);
