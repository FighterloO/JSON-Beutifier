import React, { useState, useCallback } from 'react';
import { highlightJson } from './utils/syntaxHighlighter';

// --- Helper & UI Components (defined outside App to prevent re-creation on render) ---

const Header: React.FC = () => (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-white tracking-wider">
                <span className="text-sky-400">JSON</span> Beautifier Pro
            </h1>
        </div>
    </header>
);

const BeautifyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

interface JsonInputProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
}

const JsonInput: React.FC<JsonInputProps> = ({ value, onChange, error }) => (
    <div className="relative h-full flex flex-col">
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your JSON here..."
            className="flex-grow w-full h-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg resize-none focus:outline-none focus:border-sky-500 transition-colors font-mono text-base leading-relaxed"
            spellCheck="false"
        />
        {error && (
            <div className="absolute bottom-2 left-2 right-2 bg-red-500/20 text-red-300 p-2 rounded-md border border-red-500 text-xs font-mono">
                <strong>Error:</strong> {error}
            </div>
        )}
    </div>
);


interface JsonOutputProps {
    highlightedJson: string;
}

const JsonOutput: React.FC<JsonOutputProps> = ({ highlightedJson }) => (
    <div className="h-full bg-slate-800 border-2 border-slate-700 rounded-lg overflow-auto">
        {highlightedJson ? (
            <pre className="p-4 text-base leading-relaxed">
                <code dangerouslySetInnerHTML={{ __html: highlightedJson }} className="font-mono" />
            </pre>
        ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>Formatted JSON will appear here</p>
            </div>
        )}
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
    const [rawJson, setRawJson] = useState<string>('');
    const [formattedJson, setFormattedJson] = useState<string>('');
    const [highlightedJson, setHighlightedJson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleBeautify = useCallback(() => {
        if (!rawJson.trim()) {
            setError('Input is empty.');
            setFormattedJson('');
            setHighlightedJson('');
            return;
        }
        try {
            const parsed = JSON.parse(rawJson);
            const pretty = JSON.stringify(parsed, null, 2);
            setFormattedJson(pretty);
            setHighlightedJson(highlightJson(pretty));
            setError(null);
        } catch (e: any) {
            setError(e.message);
            setFormattedJson('');
            setHighlightedJson('');
        }
    }, [rawJson]);

    const handleClear = useCallback(() => {
        setRawJson('');
        setFormattedJson('');
        setHighlightedJson('');
        setError(null);
        setIsCopied(false);
    }, []);

    const handleCopy = useCallback(() => {
        if (formattedJson) {
            navigator.clipboard.writeText(formattedJson).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    }, [formattedJson]);

    return (
        <div className="h-screen flex flex-col font-sans">
            <Header />
            
            <div className="container mx-auto p-4 flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <button onClick={handleBeautify} className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75">
                        <BeautifyIcon />
                        Beautify
                    </button>
                    <button onClick={handleCopy} disabled={!formattedJson} className="flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed">
                        <CopyIcon />
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleClear} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                        <ClearIcon />
                        Clear
                    </button>
                </div>
            </div>

            <main className="flex-grow container mx-auto p-4 pt-0 grid md:grid-cols-2 gap-4 min-h-0">
                <JsonInput value={rawJson} onChange={setRawJson} error={error} />
                <JsonOutput highlightedJson={highlightedJson} />
            </main>
        </div>
    );
};

export default App;
