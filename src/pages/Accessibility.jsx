import React from 'react';
import { motion } from 'framer-motion';
import { Accessibility as AccessIcon, CheckCircle } from 'lucide-react';

const Accessibility = () => {
    return (
        <div className="pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Tilgjengelighetserklæring</h1>

                    <div className="bg-blue-50 p-8 rounded-3xl mb-12 flex items-start gap-6 border border-blue-100">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-brand shadow-sm shrink-0">
                            <AccessIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">Vår forpliktelse</h2>
                            <p className="text-gray-600">Vi jobber kontinuerlig for at tk-design.no skal være universelt utformet og tilgjengelig for alle, uavhengig av funksjonsevne eller utstyr.</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tiltak vi gjør</h2>
                            <ul className="space-y-4">
                                {[
                                    'Bruker semantisk HTML for korrekt struktur.',
                                    'Sørger for god fargekontrast i alle elementer.',
                                    'Tydelig fokustilstand for tastaturnavigasjon.',
                                    'Beskrivende alternativ tekst på alle viktige bilder.',
                                    'Responsivt design som fungerer på alle skjermstørrelser.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-600">
                                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Tilbakemelding</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Oppdager du innhold som ikke er tilgjengelig, eller har du forslag til forbedringer? Ta kontakt med oss på <a href="mailto:thomas@tk-design.no" className="text-brand font-bold underline">thomas@tk-design.no</a>.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Accessibility;
