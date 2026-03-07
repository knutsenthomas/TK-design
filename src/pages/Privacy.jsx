import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, FileText } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="pt-32 pb-20 px-6">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Personvernerklæring</h1>
                    <p className="text-lg text-gray-500 mb-12">Sist oppdatert: 7. mars 2026</p>

                    <div className="space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-brand" /> 1. Innledning
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                TK-design er forpliktet til å beskytte ditt personvern. Denne personvernerklæringen forklarer hvordan vi samler inn, bruker og beskytter din informasjon når du besøker vår nettside.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-brand" /> 2. Informasjon vi samler inn
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Vi samler kun inn informasjon som er nødvendig for å gi deg en god brukeropplevelse og for å kunne svare på dine henvendelser:
                            </p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                <li>Navn og kontaktinformasjon sendt via kontaktskjema.</li>
                                <li>Anonymisert bruksdata via Google Analytics 4 (hvis samtykket).</li>
                                <li>Informasjonskapsler for å huske språkvalg.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock className="w-6 h-6 text-brand" /> 3. Hvordan vi bruker dataen
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Din data brukes utelukkende til det formålet den ble samlet inn for – enten det er å svare på et spørsmål eller å forbedre stabiliteten på nettsiden. Vi selger aldri din data til tredjeparter.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-brand" /> 4. Dine rettigheter
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Du har rett til å be om innsyn i, retting eller sletting av dine personopplysninger. Kontakt oss på thomas@tk-design.no om du har spørsmål.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Privacy;
