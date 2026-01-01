
import { Sdk, ApiEndpoint, DocNode, ForumThread, FaqItem } from './types';

export const APP_CONSTANTS = {
    DEFAULT_API_KEY: 'sk-demobank-mock-key-12345',
    AI_MODEL: 'gemini-3-flash-preview',
    MAX_PROMPT_HISTORY: 20,
    SUPPORTED_AI_LANGUAGES: ['TypeScript', 'Python', 'Go', 'Ruby', 'Java', 'C#', 'PHP', 'Node.js', 'Rust', 'Dart'],
    SDK_PLATFORMS: ['frontend', 'backend', 'mobile', 'universal'],
    SDK_LICENSES: ['MIT', 'Apache 2.0', 'GPL 3.0', 'Proprietary'],
    DEFAULT_THEME: 'dark',
};

export const MOCK_SDKS: Sdk[] = [
    {
        id: 'ts',
        language: 'TypeScript',
        version: '3.5.1',
        docsUrl: '/docs/ts',
        description: 'The official TypeScript SDK for integrating with DemoBank APIs.',
        platform: 'universal',
        dependencies: ['axios', 'rxjs'],
        lastUpdated: '2023-11-15',
        avgDownloadTimeMs: 1200,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 1234,
        forks: 567,
        issues: 23,
        contributors: ['alice', 'bob', 'charlie'],
        releaseNotesUrl: '/release-notes/ts-3.5.1',
        setupGuideUrl: '/guides/ts-setup',
        installationCmd: 'npm install @demobank/ts-sdk',
        packageName: '@demobank/ts-sdk',
        usageExamples: [
            { title: 'Create Payment', snippet: `import { PaymentService } from '@demobank/ts-sdk';\nconst service = new PaymentService(apiKey);\nawait service.createPayment({ amount: 100, currency: 'USD' });` },
            { title: 'Fetch Account', snippet: `import { AccountService } from '@demobank/ts-sdk';\nconst service = new AccountService(apiKey);\nawait service.getAccount('acc_123');` },
        ],
        supportedFrameworks: ['Node.js', 'React', 'Angular', 'Vue'],
    },
    {
        id: 'py',
        language: 'Python',
        version: '2.8.0',
        docsUrl: '/docs/py',
        description: 'A comprehensive Python SDK for backend and data processing tasks.',
        platform: 'backend',
        dependencies: ['requests', 'dataclasses_json'],
        lastUpdated: '2023-11-10',
        avgDownloadTimeMs: 900,
        maintainer: 'DemoBank Dev Team',
        license: 'Apache 2.0',
        stars: 2100,
        forks: 890,
        issues: 15,
        contributors: ['diana', 'eve'],
        releaseNotesUrl: '/release-notes/py-2.8.0',
        setupGuideUrl: '/guides/py-setup',
        installationCmd: 'pip install demobank-python-sdk',
        packageName: 'demobank-python-sdk',
        usageExamples: [
            { title: 'Create Customer', snippet: `from demobank import CustomerService\nservice = CustomerService(api_key)\nservice.create_customer(name="John Doe")` },
            { title: 'List Transactions', snippet: `from demobank import TransactionService\nservice = TransactionService(api_key)\ntransactions = service.list_transactions(limit=10)` },
        ],
        supportedFrameworks: ['Django', 'Flask', 'FastAPI'],
    },
    {
        id: 'node',
        language: 'Node.js',
        version: '4.1.0',
        docsUrl: '/docs/node',
        description: 'Official Node.js SDK for server-side JavaScript applications.',
        platform: 'backend',
        dependencies: ['axios', 'dotenv'],
        lastUpdated: '2023-11-18',
        avgDownloadTimeMs: 1100,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 1800,
        forks: 700,
        issues: 20,
        contributors: ['sam', 'taylor'],
        releaseNotesUrl: '/release-notes/node-4.1.0',
        setupGuideUrl: '/guides/node-setup',
        installationCmd: 'npm install @demobank/node-sdk',
        packageName: '@demobank/node-sdk',
        usageExamples: [
            { title: 'Create Charge', snippet: `const { Demobank } = require('@demobank/node-sdk');\nconst demobank = new Demobank('YOUR_API_KEY');\nawait demobank.charges.create({ amount: 2000, currency: 'usd' });` },
            { title: 'Retrieve Customer', snippet: `const { Demobank } = require('@demobank/node-sdk');\nconst demobank = new Demobank('YOUR_API_KEY');\nawait demobank.customers.retrieve('cus_abc');` },
        ],
        supportedFrameworks: ['Express', 'NestJS', 'Koa'],
    },
    {
        id: 'go',
        language: 'Go',
        version: '1.12.3',
        docsUrl: '/docs/go',
        description: 'High-performance Go SDK for microservices and critical backend systems.',
        platform: 'backend',
        dependencies: ['go-resty/resty', 'jsoniter'],
        lastUpdated: '2023-10-28',
        avgDownloadTimeMs: 700,
        maintainer: 'DemoBank Dev Team',
        license: 'MIT',
        stars: 980,
        forks: 340,
        issues: 8,
        contributors: ['frank', 'grace'],
        releaseNotesUrl: '/release-notes/go-1.12.3',
        setupGuideUrl: '/guides/go-setup',
        installationCmd: 'go get github.com/demobank/go-sdk',
        packageName: 'github.com/demobank/go-sdk',
        usageExamples: [
            { title: 'Initiate Transfer', snippet: `package main\nimport "github.com/demobank/go-sdk"\nfunc main() {\n  client := demobank.NewClient("YOUR_API_KEY")\n  client.Transfers.Create(transferRequest)\n}` },
        ],
        supportedFrameworks: ['Gin', 'Echo', 'Gorilla/Mux'],
    }
];

export const MOCK_API_ENDPOINTS: ApiEndpoint[] = [
    {
        id: 'get-payments', path: '/v1/payments', method: 'GET', description: 'Retrieve a list of all payments.', tags: ['payments', 'read'],
        queryParams: [{ name: 'limit', type: 'integer', description: 'Number of payments to retrieve.' }, { name: 'status', type: 'string', description: 'Filter by payment status.' }],
        exampleResponse: JSON.stringify([{ id: 'pay_xyz', amount: 100, currency: 'USD', status: 'succeeded' }])
    },
    {
        id: 'create-payment', path: '/v1/payments', method: 'POST', description: 'Create a new payment.', tags: ['payments', 'write'],
        exampleRequest: JSON.stringify({ amount: 1000, currency: 'USD', customerId: 'cus_123' }, null, 2),
        exampleResponse: JSON.stringify({ id: 'pay_abc', amount: 1000, currency: 'USD', status: 'pending' })
    },
    {
        id: 'list-customers', path: '/v1/customers', method: 'GET', description: 'List all customer accounts.', tags: ['customers', 'read'],
        exampleResponse: JSON.stringify([{ id: 'cus_1', name: 'Alice', email: 'alice@example.com' }])
    }
];

export const MOCK_DOCS_STRUCTURE: { [key: string]: DocNode[] } = {
    'Getting Started': [
        { title: 'Introduction', path: '/docs/introduction', description: 'Welcome to the DemoBank Developer Portal.' },
        { title: 'Authentication', path: '/docs/authentication', description: 'How to authenticate your API requests.' },
        { title: 'Error Codes', path: '/docs/error_codes', description: 'Understanding common API error responses.' },
    ],
    'SDK Reference': MOCK_SDKS.map(sdk => ({
        title: `${sdk.language} SDK`,
        path: sdk.docsUrl,
        description: `Reference documentation for the ${sdk.language} SDK.`,
        children: [
            { title: 'Installation', path: `${sdk.docsUrl}#installation`, description: `How to install the ${sdk.language} SDK.` },
            { title: 'Quick Start', path: `${sdk.docsUrl}#quick-start`, description: `First steps with ${sdk.language}.` }
        ]
    }))
};

export const MOCK_FORUM_THREADS: ForumThread[] = [
    {
        id: 'ft_1', title: 'Python SDK v2.8.0 not installing on M1 Mac', author: 'devuser1', lastActivity: '2023-11-28T14:30:00Z', replies: 5, tags: ['python', 'installation', 'bug'],
        content: 'I\'m having trouble installing the Python SDK on my M1 Mac. Any ideas?',
        comments: [
            { id: 'fc_1_1', author: 'helperbot', timestamp: '2023-11-28T14:35:00Z', content: 'Please ensure you have Rosetta 2 installed.' }
        ]
    }
];

export const MOCK_FAQS: FaqItem[] = [
    {
        id: 'faq_1', question: 'How do I get my API key?', tags: ['authentication', 'setup'],
        answer: 'You can generate and manage your API keys from the Developer Settings page in your dashboard.'
    },
    {
        id: 'faq_2', question: 'What is the rate limit for API calls?', tags: ['api', 'limits'],
        answer: 'Our standard rate limit is 100 requests per second per API key.'
    }
];
