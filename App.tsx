import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { highlightJson } from './utils/syntaxHighlighter';

// --- Theme Configuration ---

type ThemeColor = 'blue' | 'green' | 'yellow' | 'red' | 'white';

const THEMES: Record<ThemeColor, {
    name: string;
    primary: string;
    primaryHover: string;
    primaryRing: string;
    primaryText: string;
    focusBorder: string;
    icon: string;
    headerBg: string;
    headerBorder: string;
}> = {
    blue: {
        name: 'Sky Blue',
        primary: 'bg-sky-600',
        primaryHover: 'hover:bg-sky-500',
        primaryRing: 'focus:ring-sky-400',
        primaryText: 'text-sky-400',
        focusBorder: 'focus:border-sky-500',
        icon: 'text-sky-300',
        headerBg: 'bg-slate-800/70',
        headerBorder: 'border-sky-800',
    },
    green: {
        name: 'Emerald Green',
        primary: 'bg-emerald-600',
        primaryHover: 'hover:bg-emerald-500',
        primaryRing: 'focus:ring-emerald-400',
        primaryText: 'text-emerald-400',
        focusBorder: 'focus:border-emerald-500',
        icon: 'text-emerald-300',
        headerBg: 'bg-slate-800/70',
        headerBorder: 'border-emerald-800',
    },
    yellow: {
        name: 'Amber Yellow',
        primary: 'bg-amber-500',
        primaryHover: 'hover:bg-amber-400',
        primaryRing: 'focus:ring-amber-300',
        primaryText: 'text-amber-400',
        focusBorder: 'focus:border-amber-500',
        icon: 'text-amber-300',
        headerBg: 'bg-slate-800/70',
        headerBorder: 'border-amber-700',
    },
    red: {
        name: 'Rose Red',
        primary: 'bg-rose-600',
        primaryHover: 'hover:bg-rose-500',
        primaryRing: 'focus:ring-rose-400',
        primaryText: 'text-rose-400',
        focusBorder: 'focus:border-rose-500',
        icon: 'text-rose-300',
        headerBg: 'bg-slate-800/70',
        headerBorder: 'border-rose-800',
    },
    white: {
        name: 'Cool White',
        primary: 'bg-slate-200 text-slate-800',
        primaryHover: 'hover:bg-slate-50',
        primaryRing: 'focus:ring-slate-400',
        primaryText: 'text-slate-100',
        focusBorder: 'focus:border-slate-300',
        icon: 'text-slate-300',
        headerBg: 'bg-slate-800/70',
        headerBorder: 'border-slate-600',
    }
};

// --- Helper & UI Components ---

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

const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

interface SearchBoxProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    onPrev: () => void;
    onNext: () => void;
    matchCount: number;
    currentMatchIndex: number;
}

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, onSearchChange, onPrev, onNext, matchCount, currentMatchIndex }) => (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-md border border-slate-600 p-1 flex items-center text-xs w-full">
        <input
            type="text"
            placeholder="Search formatted JSON..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent px-2 py-1 w-full focus:outline-none"
        />
        <span className="text-slate-400 mx-2 select-none flex-shrink-0">
            {matchCount > 0 ? `${currentMatchIndex + 1} / ${matchCount}` : '0 / 0'}
        </span>
        <div className="flex items-center">
            <button onClick={onPrev} disabled={matchCount === 0} className="px-1 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={onNext} disabled={matchCount === 0} className="px-1 text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    </div>
);


interface ThemeSelectorProps {
    currentThemeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentThemeColor, setThemeColor }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentTheme = THEMES[currentThemeColor];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center p-2 bg-slate-700 text-white font-semibold rounded-md ${currentTheme.primaryHover} transition-colors focus:outline-none focus:ring-2 ${currentTheme.primaryRing} focus:ring-opacity-75`}
                aria-label="Select Theme"
            >
                <PaletteIcon />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20">
                    {Object.entries(THEMES).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setThemeColor(key as ThemeColor);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center ${currentThemeColor === key ? theme.primaryText : ''}`}
                        >
                            <span className={`w-3 h-3 rounded-full mr-3 ${theme.primary} border border-slate-500`}></span>
                            {theme.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

interface HeaderProps {
    theme: typeof THEMES[ThemeColor];
    themeColor: ThemeColor;
    setThemeColor: (color: ThemeColor) => void;
    onCopy: () => void;
    onClear: () => void;
    isCopyDisabled: boolean;
    isCopied: boolean;
    searchProps: SearchBoxProps;
}

const Header: React.FC<HeaderProps> = ({ theme, themeColor, setThemeColor, onCopy, onClear, isCopyDisabled, isCopied, searchProps }) => (
    <header className={`backdrop-blur-sm p-4 border-b shadow-md sticky top-0 z-20 transition-colors duration-300 ${theme.headerBg} ${theme.headerBorder}`}>
        <div className="container mx-auto flex items-center justify-between gap-4">
            <h1 className="text-xl font-bold text-white tracking-wider flex-shrink-0">
                <span className={`transition-colors duration-300 ${theme.primaryText}`}>JSON Beautifier</span> Pro
            </h1>
            <div className="flex-1 min-w-0 flex justify-center">
                <div className="w-full max-w-md">
                    <SearchBox {...searchProps} />
                </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <ThemeSelector currentThemeColor={themeColor} setThemeColor={setThemeColor} />
                 <button onClick={onCopy} disabled={isCopyDisabled} className={`flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-semibold rounded-md ${theme.primaryHover} transition-colors focus:outline-none focus:ring-2 ${theme.primaryRing} focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <CopyIcon />
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={onClear} className="flex items-center justify-center px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                    <ClearIcon />
                    Clear
                </button>
            </div>
        </div>
    </header>
);

interface JsonInputProps {
    value: string;
    onChange: (value: string) => void;
    error: string | null;
    focusBorderColor: string;
}

const JsonInput: React.FC<JsonInputProps> = ({ value, onChange, error, focusBorderColor }) => (
    <div className="relative h-full flex flex-col">
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste your JSON here..."
            className={`flex-grow w-full h-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg resize-none focus:outline-none ${focusBorderColor} transition-colors font-mono text-base leading-relaxed`}
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

const JsonOutput: React.FC<JsonOutputProps> = ({ highlightedJson }) => {
    const outputRef = useRef<HTMLPreElement>(null);

    useEffect(() => {
        const activeElement = outputRef.current?.querySelector('#active-search-match');
        if (activeElement) {
            activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedJson]);

    return (
        <div className="h-full bg-slate-800 border-2 border-slate-700 rounded-lg overflow-auto">
            {highlightedJson ? (
                <pre className="p-4 text-base leading-relaxed" ref={outputRef}>
                    <code dangerouslySetInnerHTML={{ __html: highlightedJson }} className="font-mono" />
                </pre>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                    <p>Formatted JSON will appear here</p>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const App: React.FC = () => {
    const [rawJson, setRawJson] = useState<string>('');
    const [formattedJson, setFormattedJson] = useState<string>('');
    const [highlightedJson, setHighlightedJson] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    
    const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
        const savedTheme = localStorage.getItem('json-beautifier-theme') as ThemeColor | null;
        return savedTheme || 'blue';
    });

    useEffect(() => {
        localStorage.setItem('json-beautifier-theme', themeColor);
    }, [themeColor]);

    const theme = THEMES[themeColor];
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [matches, setMatches] = useState<number[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    
    const handleBeautify = useCallback((jsonToParse: string) => {
        if (!jsonToParse.trim()) {
            setError(null);
            setFormattedJson('');
            setHighlightedJson('');
            return;
        }
        try {
            const parsed = JSON.parse(jsonToParse);
            const pretty = JSON.stringify(parsed, null, 2);
            setFormattedJson(pretty);
            setHighlightedJson(highlightJson(pretty));
            setError(null);
        } catch (e: any) {
            setError(e.message);
            setFormattedJson('');
            setHighlightedJson('');
        }
    }, []);
    
    useEffect(() => {
        handleBeautify(rawJson);
    }, [rawJson, handleBeautify]);

    const handleClear = useCallback(() => {
        setRawJson('');
        setFormattedJson('');
        setHighlightedJson('');
        setError(null);
        setIsCopied(false);
        setSearchTerm('');
    }, []);

    const handleCopy = useCallback(() => {
        if (formattedJson) {
            navigator.clipboard.writeText(formattedJson).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    }, [formattedJson]);

    // --- Search Logic ---
    useEffect(() => {
        if (searchTerm) {
            const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
            const foundMatches = [...formattedJson.matchAll(regex)].map(m => m.index!);
            setMatches(foundMatches);
            setCurrentMatchIndex(0);
        } else {
            setMatches([]);
        }
    }, [searchTerm, formattedJson]);

    const navigateMatches = (direction: 'next' | 'prev') => {
        if (matches.length === 0) return;

        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentMatchIndex + 1) % matches.length;
        } else {
            nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        }
        setCurrentMatchIndex(nextIndex);
    };

    const highlightedOutputJson = useMemo(() => {
        if (!searchTerm || !highlightedJson) {
            return highlightedJson;
        }

        const segments = highlightedJson.split(/(<[^>]+>)/);
        const escapedTerm = escapeRegExp(searchTerm);
        const regex = new RegExp(escapedTerm, 'gi');
        let matchCounter = 0;

        const newSegments = segments.map((segment, i) => {
            if (i % 2 === 0) { // Text segment
                return segment.replace(regex, (match) => {
                    const isActive = matchCounter === currentMatchIndex;
                    const id = isActive ? 'id="active-search-match"' : '';
                    const activeClass = isActive ? 'active-match' : '';
                    matchCounter++;
                    return `<mark ${id} class="search-match ${activeClass}">${match}</mark>`;
                });
            }
            return segment; // Tag segment
        });

        return newSegments.join('');
    }, [highlightedJson, searchTerm, currentMatchIndex]);

    return (
        <div className="h-screen flex flex-col font-sans">
            <Header 
                theme={theme}
                themeColor={themeColor}
                setThemeColor={setThemeColor}
                onCopy={handleCopy}
                onClear={handleClear}
                isCopied={isCopied}
                isCopyDisabled={!formattedJson}
                searchProps={{
                    searchTerm: searchTerm,
                    onSearchChange: setSearchTerm,
                    onPrev: () => navigateMatches('prev'),
                    onNext: () => navigateMatches('next'),
                    matchCount: matches.length,
                    currentMatchIndex: currentMatchIndex
                }}
            />
            
            <main className="flex-grow container mx-auto p-4 grid md:grid-cols-2 gap-4 min-h-0">
                <JsonInput 
                    value={rawJson} 
                    onChange={setRawJson} 
                    error={error}
                    focusBorderColor={theme.focusBorder}
                />
                <JsonOutput 
                    highlightedJson={highlightedOutputJson}
                />
            </main>
        </div>
    );
};

export default App;
