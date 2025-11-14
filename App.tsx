

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
// import { highlightJson } from './utils/syntaxHighlighter'; // highlightJson is no longer used for rendering output


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
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 2 0 00-1 1v3M4 7h16" />
    </svg>
);

const PaletteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
);

const JwtIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
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
    isJwtMode: boolean;
    onToggleJwtMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, themeColor, setThemeColor, onCopy, onClear, isCopyDisabled, isCopied, searchProps, isJwtMode, onToggleJwtMode }) => (
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
                <button
                    onClick={onToggleJwtMode}
                    className={`flex items-center justify-center px-4 py-2 bg-slate-700 text-white font-semibold rounded-md ${theme.primaryHover} transition-colors focus:outline-none focus:ring-2 ${theme.primaryRing} focus:ring-opacity-75
                        ${isJwtMode ? `!${theme.primary} !ring-2 !${theme.primaryRing} ring-opacity-100` : ''}`}
                    aria-pressed={isJwtMode}
                >
                    <JwtIcon />
                    Decode JWT
                </button>
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
            placeholder="Paste your JSON or JWT here..."
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


// --- JsonItem Component (Recursive for Collapsible JSON) ---
interface JsonItemProps {
    keyName?: string | number; // Key for objects, index for arrays
    value: any;
    depth: number;
    searchTerm: string;
    currentMatchIndex: number;
    registerMatch: (id: number, node: HTMLElement) => void;
    globalMatchIdCounter: React.MutableRefObject<number>;
    renderLineEndComma: boolean; // To add comma at the end of lines
}

const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const JsonItem: React.FC<JsonItemProps> = React.memo(({ keyName, value, depth, searchTerm, currentMatchIndex, registerMatch, globalMatchIdCounter, renderLineEndComma }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
    const isArray = Array.isArray(value);

    const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);

    // Helper to apply syntax highlighting classes and search highlights to a string value
    const renderTextSegment = useCallback((text: string, type: 'key' | 'string' | 'number' | 'boolean' | 'null') => {
        let className = '';
        switch (type) {
            case 'key': className = 'text-sky-400'; break;
            case 'string': className = 'text-emerald-400'; break;
            case 'number': className = 'text-fuchsia-400'; break;
            case 'boolean': className = 'text-amber-400'; break;
            case 'null': className = 'text-slate-400'; break;
        }

        if (!searchTerm) {
            return <span className={className}>{text}</span>;
        }

        const escapedTerm = escapeRegExp(searchTerm);
        const regex = new RegExp(escapedTerm, 'gi');
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Apply search highlighting
        text.replace(regex, (match, offset) => {
            // Add text before the match
            if (offset > lastIndex) {
                parts.push(<span key={`text-pre-${globalMatchIdCounter.current}-${lastIndex}`} className={className}>{text.substring(lastIndex, offset)}</span>);
            }

            // Add the matched text with search highlighting
            const matchId = globalMatchIdCounter.current++; // Assign global ID and increment
            const isActive = matchId === currentMatchIndex;
            const matchRef = useRef<HTMLSpanElement>(null);

            // Register the match element for scrolling
            useEffect(() => {
                if (matchRef.current) {
                    registerMatch(matchId, matchRef.current);
                }
            }, [registerMatch, matchId]); 

            parts.push(
                <mark key={`match-${matchId}-${offset}`} className={`search-match ${isActive ? 'active-match' : ''}`} ref={matchRef}>
                    <span className={className}>{match}</span>
                </mark>
            );
            lastIndex = offset + match.length;
            return match;
        });

        // Add remaining text after the last match
        if (lastIndex < text.length) {
            parts.push(<span key={`text-post-${globalMatchIdCounter.current}-${lastIndex}`} className={className}>{text.substring(lastIndex)}</span>);
        }
        return <>{parts}</>;
    }, [searchTerm, currentMatchIndex, globalMatchIdCounter, registerMatch]);

    // Function to render a primitive value
    const renderPrimitive = useCallback((val: any) => {
        const stringified = JSON.stringify(val); // Stringify to handle quotes for strings and correct representation
        let type: 'string' | 'number' | 'boolean' | 'null';
        if (typeof val === 'string') type = 'string';
        else if (typeof val === 'number') type = 'number';
        else if (typeof val === 'boolean') type = 'boolean';
        else type = 'null';
        return renderTextSegment(stringified, type);
    }, [renderTextSegment]);


    const indentation = `  `.repeat(depth); // Visual indentation

    // Render logic for objects and arrays
    if (isObject || isArray) {
        const entries = isObject ? Object.entries(value) : (value as any[]).map((v, i) => ([i, v]));
        const opener = isObject ? '{' : '[';
        const closer = isObject ? '}' : ']';
        const lengthText = isObject ? `${Object.keys(value).length} items` : `${(value as any[]).length} items`;

        return (
            <div className="json-node leading-relaxed">
                <span>{indentation}</span>
                {keyName !== undefined && (
                    <>
                        {renderTextSegment(JSON.stringify(keyName), 'key')}:
                    </>
                )}
                <span className="cursor-pointer select-none text-slate-500 mr-1" onClick={toggleCollapse} role="button" aria-expanded={!isCollapsed} aria-label={`Toggle ${isObject ? 'object' : 'array'} collapse`}>
                    {isCollapsed ? (
                        <svg className="inline h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    ) : (
                        <svg className="inline h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    )}
                </span>
                <span className="text-slate-400">{opener}</span>
                {isCollapsed && (
                    <>
                        <span className="text-slate-500 ml-1">... {lengthText} ...</span>
                        <span className="text-slate-400">{closer}{renderLineEndComma ? ',' : ''}</span>
                    </>
                )}
                {!isCollapsed && (
                    <div className="ml-0">
                        {entries.map(([childKey, childValue], index) => (
                            <JsonItem
                                key={isObject ? childKey : `arr-${depth}-${index}`} // Use key for objects, unique index for arrays
                                keyName={isObject ? childKey : undefined}
                                value={childValue}
                                depth={depth + 1}
                                searchTerm={searchTerm}
                                currentMatchIndex={currentMatchIndex}
                                registerMatch={registerMatch}
                                globalMatchIdCounter={globalMatchIdCounter}
                                renderLineEndComma={index < entries.length - 1}
                            />
                        ))}
                        <span>{indentation}</span>
                        <span className="text-slate-400">{closer}{renderLineEndComma ? ',' : ''}</span>
                    </div>
                )}
            </div>
        );
    } else { // Primitive value
        return (
            <div className="json-node leading-relaxed">
                <span>{indentation}</span>
                {keyName !== undefined && (
                    <>
                        {renderTextSegment(JSON.stringify(keyName), 'key')}:
                    </>
                )}
                {renderPrimitive(value)}
                {renderLineEndComma ? <span className="text-slate-400">,</span> : ''}
            </div>
        );
    }
});
JsonItem.displayName = 'JsonItem'; // For React Dev Tools

// --- CollapsibleJsonOutput Component (Wrapper for Collapsible JSON) ---
interface CollapsibleJsonOutputProps {
    parsedJson: any;
    searchTerm: string;
    currentMatchIndex: number;
}

const CollapsibleJsonOutput: React.FC<CollapsibleJsonOutputProps> = React.memo(({ parsedJson, searchTerm, currentMatchIndex }) => {
    // Maps global match ID to its HTMLElement for scrolling
    const globalSearchMatchElements = useRef<Map<number, HTMLElement>>(new Map());
    // Counter for assigning unique IDs to each search match during rendering
    const globalMatchIdCounter = useRef(0);

    const registerMatch = useCallback((id: number, node: HTMLElement) => {
        globalSearchMatchElements.current.set(id, node);
    }, []);

    // Reset the counter and map when JSON or search term changes
    // This ensures search match IDs are consistent and references are fresh
    useEffect(() => {
        globalMatchIdCounter.current = 0;
        globalSearchMatchElements.current.clear();
    }, [parsedJson, searchTerm]);

    // Scroll to active match when currentMatchIndex, search term, or JSON changes
    useEffect(() => {
        const activeMatchNode = globalSearchMatchElements.current.get(currentMatchIndex);
        if (activeMatchNode) {
            activeMatchNode.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [currentMatchIndex, searchTerm, parsedJson]);


    if (parsedJson === null || parsedJson === undefined) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500">
                <p>Formatted output will appear here</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-800 border-2 border-slate-700 rounded-lg overflow-auto">
            <pre className="p-4 text-base leading-relaxed font-mono">
                <JsonItem
                    keyName={undefined} // Root element has no key
                    value={parsedJson}
                    depth={0}
                    searchTerm={searchTerm}
                    currentMatchIndex={currentMatchIndex}
                    registerMatch={registerMatch}
                    globalMatchIdCounter={globalMatchIdCounter}
                    renderLineEndComma={false} // Root doesn't need a comma at the end
                />
            </pre>
        </div>
    );
});
CollapsibleJsonOutput.displayName = 'CollapsibleJsonOutput';


// --- Main App Component ---

// Helper function to decode Base64Url
const decodeBase64Url = (base64Url: string): string => {
    // Replace non-url-safe characters
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if missing
    switch (base64.length % 4) {
        case 0: break;
        case 2: base64 += '=='; break;
        case 3: base64 += '='; break;
        default: throw new Error('Illegal base64url string!');
    }
    return atob(base64);
};

const App: React.FC = () => {
    const [rawJson, setRawJson] = useState<string>('');
    const [formattedJson, setFormattedJson] = useState<string>(''); // Used for copying and search indexing
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState<boolean>(false);
    
    // New state for parsed JSON object, used by the CollapsibleJsonOutput
    const [parsedJson, setParsedJson] = useState<any>(null);

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
    const [matches, setMatches] = useState<number[]>([]); // Stores indices for total match count
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    // JWT Mode State
    const [isJwtMode, setIsJwtMode] = useState<boolean>(false);
    
    const processInput = useCallback((jsonToProcess: string, jwtMode: boolean) => {
        if (!jsonToProcess.trim()) {
            setError(null);
            setFormattedJson('');
            setParsedJson(null); // Clear parsed JSON for display
            setSearchTerm(''); // Clear search on empty input
            setMatches([]);
            setCurrentMatchIndex(0);
            return;
        }

        let processedData: any = null;
        let formattedOutputString = '';

        if (jwtMode) {
            try {
                const parts = jsonToProcess.split('.');
                if (parts.length !== 3) {
                    throw new Error('Invalid JWT format. A JWT must have 3 parts separated by dots.');
                }

                const header = JSON.parse(decodeBase64Url(parts[0]));
                const payload = JSON.parse(decodeBase64Url(parts[1]));
                // Signature (parts[2]) is not decoded here as it's not JSON

                const decodedJwt = {
                    header: header,
                    payload: payload,
                    signature: parts[2]
                };

                processedData = decodedJwt;
                formattedOutputString = JSON.stringify(decodedJwt, null, 2);
                setError(null);
            } catch (e: any) {
                setError(`JWT Decoding Error: ${e.message}`);
                setFormattedJson('');
                setParsedJson(null); // Clear parsed JSON on error
            }
        } else {
            try {
                processedData = JSON.parse(jsonToProcess);
                formattedOutputString = JSON.stringify(processedData, null, 2);
                setError(null);
            } catch (e: any) {
                setError(e.message);
                setFormattedJson('');
                setParsedJson(null); // Clear parsed JSON on error
            }
        }
        setParsedJson(processedData); // Update parsed JSON for display
        setFormattedJson(formattedOutputString); // Update formatted string for copy/search
    }, []);

    useEffect(() => {
        processInput(rawJson, isJwtMode);
    }, [rawJson, isJwtMode, processInput]);

    const handleClear = useCallback(() => {
        setRawJson('');
        setFormattedJson('');
        setParsedJson(null); // Clear parsed JSON
        setError(null);
        setIsCopied(false);
        setSearchTerm('');
        setMatches([]); // Clear matches
        setCurrentMatchIndex(0); // Reset index
        setIsJwtMode(false); // Reset JWT mode
    }, []);

    const handleCopy = useCallback(() => {
        if (formattedJson) {
            navigator.clipboard.writeText(formattedJson).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            });
        }
    }, [formattedJson]);

    const handleToggleJwtMode = useCallback(() => {
        setIsJwtMode(prevMode => !prevMode);
    }, []);

    // --- Search Logic ---
    // This effect calculates total matches in the formattedJson string for the header count.
    // The actual highlighting and scrolling are handled by CollapsibleJsonOutput/JsonItem.
    useEffect(() => {
        if (searchTerm && formattedJson) {
            const regex = new RegExp(escapeRegExp(searchTerm), 'gi');
            const foundMatches = [...formattedJson.matchAll(regex)].map(m => m.index!);
            setMatches(foundMatches);
            setCurrentMatchIndex(0); // Reset current match index when search term or content changes
        } else {
            setMatches([]);
            setCurrentMatchIndex(0);
        }
    }, [searchTerm, formattedJson]);

    const navigateMatches = useCallback((direction: 'next' | 'prev') => {
        if (matches.length === 0) return;

        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentMatchIndex + 1) % matches.length;
        } else {
            nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        }
        setCurrentMatchIndex(nextIndex);
    }, [matches, currentMatchIndex]);


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
                isJwtMode={isJwtMode}
                onToggleJwtMode={handleToggleJwtMode}
            />
            
            <main className="flex-grow container mx-auto p-4 grid md:grid-cols-2 gap-4 min-h-0">
                <JsonInput 
                    value={rawJson} 
                    onChange={setRawJson} 
                    error={error}
                    focusBorderColor={theme.focusBorder}
                />
                <CollapsibleJsonOutput 
                    parsedJson={parsedJson}
                    searchTerm={searchTerm}
                    currentMatchIndex={currentMatchIndex}
                />
            </main>
        </div>
    );
};

export default App;