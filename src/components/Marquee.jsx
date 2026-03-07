import React from 'react';
import { motion } from 'framer-motion';

const Marquee = ({ words }) => {
    return (
        <div className="bg-[#1B4965] py-4 overflow-hidden flex whitespace-nowrap">
            <motion.div
                animate={{ x: [0, -1000] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex gap-12 items-center text-white/80 font-bold uppercase tracking-widest text-sm"
            >
                {[...words, ...words, ...words, ...words].map((word, i) => (
                    <span key={i} className="flex items-center gap-12">
                        {word}
                        <span className="w-2 h-2 rounded-full bg-white/30" />
                    </span>
                ))}
            </motion.div>
        </div>
    );
};

export default Marquee;
