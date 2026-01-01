
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navigation from './components/Navigation';
import Card from './components/Card';
import { 
    Sdk, ApiResponse, DownloadHistoryEntry, SavedPrompt, 
    AiConfig, UserPreferences, ApiEndpoint, ApiRequestPayload,
    ApiRequestHistoryEntry, DocSearchResult, ForumThread, Toast 
} from './types';
import { 
    APP_CONSTANTS, MOCK_SDKS, MOCK_API_ENDPOINTS, 
    MOCK_DOCS_STRUCTURE, MOCK_FORUM_THREADS, MOCK_FAQS 
} from './constants';
import { generateAiResponse } from './services/geminiService';

const App: React.FC = () => {
    // --- Navigation State ---
    const [currentView, setCurrentView] = useState<string>('overview');

    // --- Global State ---
    const [userPreferences, setUserPreferences] = useState<UserPreferences>({
        theme: 'dark',
        receiveMarketingEmails: true,
        receiveSdkUpdateNotifications: true,
        enableAiAssistedCoding: true,
        aiConfig: {
            model: APP_CONSTANTS.AI_MODEL,
            temperature: 0.7,
            maxTokens: 1000,
            defaultPersona: 'expert-developer',
            enableContextualLearning: true,
            preferredLanguages: ['TypeScript', 'Python'],
        },
        favoriteSdks: ['ts', 'node'],
    });

    const [apiKey, setApiKey] = useState(APP_CONSTANTS.DEFAULT_API_KEY);
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    // --- SDK Module State ---
    const [selectedSdk, setSelectedSdk] = useState<Sdk | null>(null);
    const [sdkSearch, setSdkSearch] = useState('');
    const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryEntry[]>([]);

    // --- AI Lab State ---
    const [aiTool, setAiTool] = useState<'gen' | 'review' | 'test' | 'deploy'>('gen');
    const [prompt, setPrompt] = useState('Create a secure payment intent for $50 USD');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

    // --- API Explorer State ---
    const [activeEndpoint, setActiveEndpoint] = useState<ApiEndpoint | null>(null);
    const [apiRequestHistory, setApiRequestHistory] = useState<ApiRequestHistoryEntry[]>([]);
    const [isRequesting, setIsRequesting] = useState(false);
    const [lastResponse, setLastResponse] = useState<ApiResponse<any> | null>(null);

    // --- Documentation State ---
    const [docSearch, setDocSearch] = useState('');
    const [activeDocPath, setActiveDocPath] = useState('/docs/introduction');

    // --- Notification Helper ---
    const addToast = (message: string, type: Toast['type'] = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    // --- AI Lab Handlers ---
    const handleGenerate = async () => {
        if (!selectedSdk) return addToast('Please select an SDK language.', 'warning');
        setIsAiLoading(true);
        try {
            const systemPrompt = `You are an expert ${selectedSdk.language} developer specializing in DemoBank integrations. 
            Generate concise, production-ready code. Use version ${selectedSdk.version}.
            Installation: ${selectedSdk.installationCmd}`;
            
            const fullPrompt = `Task: ${prompt}\nSDK: ${selectedSdk.language}\nFramework Preference: ${selectedSdk.supportedFrameworks[0]}`;
            
            const code = await generateAiResponse(fullPrompt, userPreferences.aiConfig, apiKey, systemPrompt);
            setGeneratedCode(code);
            addToast('Code generated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'AI request failed.', 'error');
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSavePrompt = () => {
        if (!generatedCode) return;
        const newSaved: SavedPrompt = {
            id: Date.now().toString(),
            prompt,
            generatedCode,
            sdkId: selectedSdk?.id || 'generic',
            language: selectedSdk?.language || 'Generic',
            timestamp: new Date().toISOString(),
            tags: ['ai-gen', selectedSdk?.language.toLowerCase() || 'code']
        };
        setSavedPrompts(prev => [newSaved, ...prev]);
        addToast('Prompt saved to library.', 'success');
    };

    // --- API Explorer Handler ---
    const handleExecuteRequest = async (payload: ApiRequestPayload) => {
        setIsRequesting(true);
        setLastResponse(null);
        try {
            // Mock network call
            await new Promise(r => setTimeout(r, 1000));
            const mockData = activeEndpoint?.exampleResponse ? JSON.parse(activeEndpoint.exampleResponse) : { status: 'mocked' };
            const response: ApiResponse<any> = { success: true, message: 'Request successful', data: mockData };
            setLastResponse(response);
            setApiRequestHistory(prev => [{ id: Date.now().toString(), request: payload, response, timestamp: new Date().toISOString() }, ...prev]);
            addToast('API Request executed.', 'success');
        } catch (err: any) {
            addToast('API Request failed.', 'error');
        } finally {
            setIsRequesting(false);
        }
    };

    // --- Derived State ---
    const filteredSdks = useMemo(() => {
        return MOCK_SDKS.filter(s => 
            s.language.toLowerCase().includes(sdkSearch.toLowerCase()) || 
            s.description.toLowerCase().includes(sdkSearch.toLowerCase())
        );
    }, [sdkSearch]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">DemoBank</span>
                        <span className="text-gray-500 font-medium">Dev Portal</span>
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-xl">
                        A robust platform for developers to integrate, test, and manage financial services using DemoBank's official SDKs.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl font-semibold border border-gray-700 transition-all flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        API Dashboard
                    </button>
                    <div className="relative group">
                        <img className="w-12 h-12 rounded-2xl ring-2 ring-gray-800 p-0.5 bg-gray-900 cursor-pointer" src="https://picsum.photos/seed/dev/200" alt="User" />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                            <button className="w-full text-left px-4 py-3 hover:bg-gray-700 text-sm">Profile Settings</button>
                            <button className="w-full text-left px-4 py-3 hover:bg-gray-700 text-sm border-t border-gray-700 text-red-400 font-semibold">Log Out</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Navigation */}
            <div className="flex justify-center mb-12">
                <Navigation currentId={currentView} onSelect={setCurrentView} />
            </div>

            {/* Main Content Area */}
            <main className="min-h-[60vh]">
                
                {/* --- Overview View --- */}
                {currentView === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <Card title="SDK Discovery">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative flex-grow">
                                        <input 
                                            type="text" 
                                            placeholder="Search languages, platforms, features..." 
                                            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                                            value={sdkSearch}
                                            onChange={e => setSdkSearch(e.target.value)}
                                        />
                                        <svg className="w-6 h-6 absolute left-4 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </div>
                                    <select className="bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-4 text-gray-400 outline-none">
                                        <option>All Platforms</option>
                                        <option>Backend</option>
                                        <option>Frontend</option>
                                        <option>Mobile</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredSdks.map(sdk => (
                                        <div 
                                            key={sdk.id} 
                                            onClick={() => setSelectedSdk(sdk)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer group
                                                ${selectedSdk?.id === sdk.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-gray-900/50 border-gray-700 hover:border-gray-500'}`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-xl font-bold text-cyan-400">
                                                        {sdk.language.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-100">{sdk.language}</h4>
                                                        <p className="text-xs text-gray-500">v{sdk.version} • {sdk.platform}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-yellow-500">
                                                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                    {sdk.stars}
                                                </div>
                                            </div>
                                            <p className="mt-4 text-sm text-gray-400 line-clamp-2">{sdk.description}</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <button className="flex-grow bg-gray-800 group-hover:bg-gray-700 text-white text-xs font-bold py-2 rounded-lg transition-colors">Documentation</button>
                                                <button className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-lg transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div className="space-y-8">
                            <Card title="Quick Stats">
                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                                        <p className="text-gray-500 text-sm font-semibold mb-1">Total API Calls</p>
                                        <h3 className="text-3xl font-bold text-white">1.2M <span className="text-green-500 text-sm font-normal">↑ 12%</span></h3>
                                    </div>
                                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                                        <p className="text-gray-500 text-sm font-semibold mb-1">Avg. Latency</p>
                                        <h3 className="text-3xl font-bold text-white">42ms</h3>
                                    </div>
                                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-700">
                                        <p className="text-gray-500 text-sm font-semibold mb-1">Active SDKs</p>
                                        <h3 className="text-3xl font-bold text-white">{MOCK_SDKS.length}</h3>
                                    </div>
                                </div>
                            </Card>
                            <Card title="Developer Updates">
                                <div className="space-y-4">
                                    {[
                                        { title: 'Node.js SDK v4.1 Released', date: '2 hours ago', type: 'Release' },
                                        { title: 'New Webhook Security Guide', date: 'Yesterday', type: 'Docs' },
                                        { title: 'Maintenance Window: Sat 2AM', date: 'Oct 20', type: 'System' }
                                    ].map((update, i) => (
                                        <div key={i} className="flex gap-4 items-start p-3 hover:bg-gray-900/50 rounded-xl transition-colors cursor-pointer group">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-cyan-500"></div>
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-100 group-hover:text-cyan-400">{update.title}</h5>
                                                <p className="text-xs text-gray-500 mt-1">{update.date} • {update.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* --- AI Code Lab View --- */}
                {currentView === 'ai-lab' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar: Config & SDK Selection */}
                        <div className="lg:col-span-1 space-y-8">
                            <Card title="Lab Setup">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target SDK</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {MOCK_SDKS.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => setSelectedSdk(s)}
                                                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all
                                                        ${selectedSdk?.id === s.id ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    {s.language}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tool Selection</label>
                                        <div className="space-y-1">
                                            {[
                                                { id: 'gen', name: 'Code Generator' },
                                                { id: 'review', name: 'Security Review' },
                                                { id: 'test', name: 'Test Architect' },
                                                { id: 'deploy', name: 'Ops Integrator' }
                                            ].map(tool => (
                                                <button 
                                                    key={tool.id}
                                                    onClick={() => setAiTool(tool.id as any)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                                        ${aiTool === tool.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                                                >
                                                    {tool.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-gray-700">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Temperature: {userPreferences.aiConfig.temperature}</label>
                                        <input 
                                            type="range" min="0" max="1" step="0.1" 
                                            value={userPreferences.aiConfig.temperature}
                                            onChange={e => setUserPreferences(prev => ({ ...prev, aiConfig: { ...prev.aiConfig, temperature: parseFloat(e.target.value) }}))}
                                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
                                        />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main Interaction Area */}
                        <div className="lg:col-span-3 space-y-8">
                            <Card title={aiTool === 'gen' ? 'Generate Implementation' : 'AI Analysis'}>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <textarea 
                                            value={prompt}
                                            onChange={e => setPrompt(e.target.value)}
                                            placeholder="What would you like the AI to build or analyze?"
                                            className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                                        />
                                        <button 
                                            onClick={handleGenerate}
                                            disabled={isAiLoading}
                                            className="absolute bottom-4 right-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
                                        >
                                            {isAiLoading ? (
                                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            )}
                                            {isAiLoading ? 'Synthesizing...' : 'Run Assistant'}
                                        </button>
                                    </div>

                                    {generatedCode && (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">AI Result</h4>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => { navigator.clipboard.writeText(generatedCode); addToast('Copied to clipboard!', 'success'); }}
                                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                                    </button>
                                                    <button 
                                                        onClick={handleSavePrompt}
                                                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <pre className="bg-gray-950 p-6 rounded-2xl border border-gray-800 overflow-x-auto text-sm text-cyan-300 custom-scrollbar max-h-[500px]">
                                                <code>{generatedCode}</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {savedPrompts.length > 0 && (
                                <Card title="Recent Snippets">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedPrompts.map(p => (
                                            <div key={p.id} onClick={() => { setPrompt(p.prompt); setGeneratedCode(p.generatedCode); }} className="p-4 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-cyan-500/50 cursor-pointer group transition-all">
                                                <h5 className="font-bold text-gray-200 line-clamp-1 group-hover:text-cyan-400">{p.prompt}</h5>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] bg-gray-800 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{p.language}</span>
                                                    <span className="text-[10px] text-gray-600">{new Date(p.timestamp).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* --- API Explorer View --- */}
                {currentView === 'api-explorer' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Endpoint List */}
                        <div className="lg:col-span-1">
                            <Card title="Endpoints">
                                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                    {MOCK_API_ENDPOINTS.map(ep => (
                                        <button 
                                            key={ep.id}
                                            onClick={() => setActiveEndpoint(ep)}
                                            className={`w-full text-left p-3 rounded-xl transition-all border
                                                ${activeEndpoint?.id === ep.id ? 'bg-gray-700 border-gray-600 shadow-lg' : 'bg-transparent border-transparent hover:bg-gray-800/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase
                                                    ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                                                    {ep.method}
                                                </span>
                                                <code className="text-xs text-gray-300">{ep.path}</code>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-1">{ep.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Request/Response */}
                        <div className="lg:col-span-3 space-y-8">
                            {activeEndpoint ? (
                                <>
                                    <Card title="Request Builder">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 bg-gray-900 border border-gray-700 rounded-xl p-3">
                                                <span className="bg-blue-500 text-white font-bold px-3 py-1 rounded-lg text-sm">{activeEndpoint.method}</span>
                                                <input readOnly value={`https://api.demobank.com${activeEndpoint.path}`} className="bg-transparent flex-grow text-gray-400 outline-none text-sm" />
                                            </div>
                                            
                                            {activeEndpoint.method === 'POST' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Request Body (JSON)</label>
                                                    <textarea 
                                                        className="w-full h-48 bg-gray-950 border border-gray-800 rounded-2xl p-4 text-cyan-400 font-mono text-xs outline-none focus:border-gray-600 transition-all"
                                                        defaultValue={activeEndpoint.exampleRequest}
                                                    />
                                                </div>
                                            )}

                                            <button 
                                                onClick={() => handleExecuteRequest({ url: activeEndpoint.path, method: activeEndpoint.method, headers: {}, body: activeEndpoint.exampleRequest })}
                                                disabled={isRequesting}
                                                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-800 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                                            >
                                                {isRequesting && <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">...</svg>}
                                                Execute Call
                                            </button>
                                        </div>
                                    </Card>

                                    {lastResponse && (
                                        <Card title="Response Payload" className="animate-in fade-in zoom-in-95 duration-300">
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 font-bold uppercase text-[10px]">Status:</span>
                                                        <span className="text-green-500 font-bold">200 OK</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-500 font-bold uppercase text-[10px]">Time:</span>
                                                        <span className="text-gray-300">124ms</span>
                                                    </div>
                                                </div>
                                                <pre className="bg-gray-950 p-6 rounded-2xl border border-gray-800 text-xs text-cyan-400 overflow-x-auto custom-scrollbar">
                                                    <code>{JSON.stringify(lastResponse.data, null, 2)}</code>
                                                </pre>
                                            </div>
                                        </Card>
                                    )}
                                </>
                            ) : (
                                <div className="h-96 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-600 gap-4">
                                    <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    <p className="font-semibold">Select an endpoint to begin testing</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- Settings View --- */}
                {currentView === 'settings' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card title="Authentication">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Development API Key</label>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="password" 
                                            value={apiKey}
                                            onChange={e => setApiKey(e.target.value)}
                                            className="flex-grow bg-gray-900 border border-gray-700 rounded-xl py-2.5 px-4 text-white outline-none focus:ring-2 focus:ring-cyan-500/50" 
                                        />
                                        <button className="bg-gray-800 p-2.5 rounded-xl border border-gray-700 hover:bg-gray-700 transition-all">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-2 italic">Used for both Gemini AI and DemoBank mock calls.</p>
                                </div>
                                <button className="w-full py-3 rounded-xl bg-gray-800 border border-gray-700 font-bold hover:bg-gray-700 transition-all">Regenerate Credentials</button>
                            </div>
                        </Card>
                        <Card title="Developer Profile">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-cyan-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-cyan-500/20">DB</div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">Dev_Beta_User</h4>
                                        <p className="text-sm text-gray-500">Tier: Enterprise Sandbox</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={userPreferences.enableAiAssistedCoding} onChange={e => setUserPreferences(prev => ({ ...prev, enableAiAssistedCoding: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-500" />
                                        <span className="text-sm font-semibold text-gray-300">Enable AI coding assistant</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-gray-900 rounded-xl border border-gray-700 cursor-pointer">
                                        <input type="checkbox" checked={userPreferences.receiveSdkUpdateNotifications} onChange={e => setUserPreferences(prev => ({ ...prev, receiveSdkUpdateNotifications: e.target.checked }))} className="w-4 h-4 rounded accent-cyan-500" />
                                        <span className="text-sm font-semibold text-gray-300">SDK update notifications</span>
                                    </label>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* --- Documentation View --- */}
                {currentView === 'documentation' && (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-1">
                            <Card title="Navigation">
                                <div className="space-y-6">
                                    {Object.entries(MOCK_DOCS_STRUCTURE).map(([category, nodes]) => (
                                        <div key={category}>
                                            <h5 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">{category}</h5>
                                            <ul className="space-y-1">
                                                {nodes.map(node => (
                                                    <li key={node.path}>
                                                        <button 
                                                            onClick={() => setActiveDocPath(node.path)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                                                                ${activeDocPath === node.path ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-gray-400 hover:text-gray-200'}`}
                                                        >
                                                            {node.title}
                                                        </button>
                                                        {node.children && activeDocPath.startsWith(node.path) && (
                                                            <ul className="ml-4 mt-1 border-l border-gray-800">
                                                                {node.children.map(child => (
                                                                    <li key={child.path}>
                                                                        <button 
                                                                            onClick={() => setActiveDocPath(child.path)}
                                                                            className="w-full text-left px-4 py-1.5 text-xs text-gray-500 hover:text-gray-300 transition-all"
                                                                        >
                                                                            {child.title}
                                                                        </button>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-3">
                            <Card className="min-h-[600px]">
                                <div className="prose prose-invert max-w-none">
                                    <h2 className="text-3xl font-extrabold text-white mb-6">Documentation Topic: {activeDocPath.split('/').pop()}</h2>
                                    <p className="text-gray-400 leading-relaxed mb-8">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                                        <h4 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Pro Tip
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            Always verify your API signatures on the server side to ensure requests originate from DemoBank. 
                                            Check our security guide for HMAC implementation details.
                                        </p>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Installation Guide</h3>
                                    <pre className="bg-gray-950 p-6 rounded-2xl border border-gray-800 text-sm text-cyan-400">
                                        <code>npm install @demobank/core-sdk</code>
                                    </pre>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* --- Community View --- */}
                {currentView === 'community' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card title="Active Discussions">
                                <div className="space-y-6">
                                    {MOCK_FORUM_THREADS.map(thread => (
                                        <div key={thread.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-2xl hover:border-gray-500 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between">
                                                <h4 className="font-bold text-gray-100 group-hover:text-cyan-400">{thread.title}</h4>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 uppercase">Discussion</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-1">{thread.content}</p>
                                            <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-wider">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                    {thread.replies} Replies
                                                </span>
                                                <span>{thread.author} • {new Date(thread.lastActivity).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <button className="w-full py-3 border-2 border-dashed border-gray-700 text-gray-500 font-bold rounded-2xl hover:border-gray-500 hover:text-gray-300 transition-all">Start a New Thread</button>
                                </div>
                            </Card>
                            <Card title="FAQ">
                                <div className="space-y-4">
                                    {MOCK_FAQS.map(faq => (
                                        <div key={faq.id} className="group">
                                            <details className="p-4 bg-gray-900/50 border border-gray-700 rounded-2xl cursor-pointer">
                                                <summary className="font-bold text-gray-200 group-hover:text-cyan-400 list-none flex items-center justify-between">
                                                    {faq.question}
                                                    <svg className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                                </summary>
                                                <p className="mt-4 text-sm text-gray-400 leading-relaxed border-t border-gray-800 pt-4">
                                                    {faq.answer}
                                                </p>
                                            </details>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

            </main>

            {/* Global Toasts */}
            <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
                {toasts.map(t => (
                    <div 
                        key={t.id} 
                        className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right-12 duration-300 border backdrop-blur-md
                            ${t.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-400' : 
                              t.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                              t.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
                              'bg-gray-800/90 border-gray-700 text-gray-200'}`}
                    >
                        {t.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                        {t.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        <span className="font-semibold text-sm">{t.message}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <footer className="mt-20 pt-12 border-t border-gray-800 text-center">
                <div className="flex justify-center gap-8 mb-8">
                    <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors">GitHub</a>
                    <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors">Twitter</a>
                    <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors">Discord</a>
                    <a href="#" className="text-gray-500 hover:text-cyan-400 transition-colors">Support</a>
                </div>
                <p className="text-gray-600 text-xs font-medium uppercase tracking-widest">
                    © 2024 DemoBank Financial Services Inc. • Built with Gemini 3
                </p>
            </footer>
        </div>
    );
};

export default App;
