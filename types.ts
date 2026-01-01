
export interface Sdk {
    id: string;
    language: string;
    version: string;
    docsUrl: string;
    description: string;
    platform: 'frontend' | 'backend' | 'mobile' | 'universal';
    dependencies: string[];
    lastUpdated: string;
    avgDownloadTimeMs: number;
    maintainer: string;
    license: 'MIT' | 'Apache 2.0' | 'GPL 3.0' | 'Proprietary';
    stars: number;
    forks: number;
    issues: number;
    contributors: string[];
    releaseNotesUrl: string;
    setupGuideUrl: string;
    installationCmd: string;
    packageName: string;
    usageExamples: { title: string; snippet: string; }[];
    supportedFrameworks: string[];
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
    errorCode?: string;
}

export interface DownloadHistoryEntry {
    sdkId: string;
    sdkVersion: string;
    timestamp: string;
    downloadUrl: string;
    os: string;
    browser: string;
    ipAddress: string;
}

export interface SavedPrompt {
    id: string;
    prompt: string;
    generatedCode: string;
    sdkId: string;
    language: string;
    timestamp: string;
    tags: string[];
}

export interface AiConfig {
    model: string;
    temperature: number;
    maxTokens: number;
    defaultPersona: string;
    enableContextualLearning: boolean;
    preferredLanguages: string[];
}

export interface ApiEndpoint {
    id: string;
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    description: string;
    requestSchema?: object;
    responseSchema?: object;
    tags: string[];
    exampleRequest?: string;
    exampleResponse?: string;
    queryParams?: { name: string; type: string; description: string; required?: boolean; }[];
    pathParams?: { name: string; type: string; description: string; }[];
}

export interface ApiRequestPayload {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers: { [key: string]: string };
    params?: { [key: string]: string };
    body?: string;
}

export interface ApiRequestHistoryEntry {
    id: string;
    request: ApiRequestPayload;
    response: ApiResponse<any>;
    timestamp: string;
}

export interface DocNode {
    title: string;
    path: string;
    description: string;
    children?: DocNode[];
}

export interface DocSearchResult {
    title: string;
    path: string;
    snippet: string;
    relevance: number;
}

export interface ForumThread {
    id: string;
    title: string;
    author: string;
    lastActivity: string;
    replies: number;
    tags: string[];
    content: string;
    comments: ForumComment[];
}

export interface ForumComment {
    id: string;
    author: string;
    timestamp: string;
    content: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
    tags: string[];
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    receiveMarketingEmails: boolean;
    receiveSdkUpdateNotifications: boolean;
    enableAiAssistedCoding: boolean;
    aiConfig: AiConfig;
    favoriteSdks: string[];
}

export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
}
