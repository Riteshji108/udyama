import { LearningTrack, PracticeQuestion, Task } from '../types';

export const LEARNING_TRACKS: LearningTrack[] = [
  {
    slug: 'data-analyst',
    title: 'Data Analyst Track',
    tagline: 'From exploratory SQL & metrics to executive dashboards and statistical experiments.',
    description: 'Master practical SQL, data modeling, metric trees, cohort retention, and business reporting expected at top tech and product companies.',
    hoursMin: 24,
    hoursMax: 36,
    difficultyLevel: 'Intermediate',
    domains: ['SQL & Databases', 'Statistics & Probability', 'Metrics & BI', 'Data Storytelling'],
    skills: [
      { slug: 'sql-joins-aggregations', name: 'SQL Joins & Grouping', category: 'SQL' },
      { slug: 'window-functions', name: 'Window Functions (LAG, RANK)', category: 'SQL' },
      { slug: 'retention-cohorts', name: 'Cohort Retention & Churn', category: 'Analytics' },
      { slug: 'ab-testing-metrics', name: 'A/B Testing & Significance', category: 'Statistics' },
      { slug: 'executive-reporting', name: 'Executive Storytelling', category: 'Business' },
    ],
    modulesCount: 16,
    questionsCount: 42,
    recommendedWeeklyHours: 10,
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst Track',
    tagline: 'Bridge business requirements, process flows, BRD/PRD documentation, and KPI trees.',
    description: 'Learn requirement elicitation, MoSCoW prioritization, stakeholder alignment, SIPOC swimlanes, and ROI financial appraisals.',
    hoursMin: 20,
    hoursMax: 32,
    difficultyLevel: 'Beginner',
    domains: ['Requirements Engineering', 'Process Mapping', 'Agile & Jira', 'Financial Modeling'],
    skills: [
      { slug: 'brd-user-stories', name: 'User Stories & Acceptance Criteria', category: 'Requirements' },
      { slug: 'process-swimlanes', name: 'Process Flow & Swimlanes', category: 'Process' },
      { slug: 'stakeholder-raci', name: 'Stakeholder RACI & Power Grid', category: 'Management' },
      { slug: 'cost-benefit-npv', name: 'Cost-Benefit & ROI Analysis', category: 'Finance' },
    ],
    modulesCount: 14,
    questionsCount: 36,
    recommendedWeeklyHours: 8,
  },
  {
    slug: 'full-stack-dev',
    title: 'Full Stack Engineering Track',
    tagline: 'Architect robust web applications with TypeScript, React, Fastify, and PostgreSQL.',
    description: 'Learn end-to-end full stack development: React 19 state architecture, REST APIs, database indexing, caching strategies, and secure auth.',
    hoursMin: 36,
    hoursMax: 52,
    difficultyLevel: 'Intermediate',
    domains: ['Frontend Architecture', 'API Design & Fastify', 'PostgreSQL & ORM', 'Production & CI/CD'],
    skills: [
      { slug: 'react-state-architecture', name: 'State Architecture & Hooks', category: 'Frontend' },
      { slug: 'fastify-rest-apis', name: 'REST APIs & Zod Validation', category: 'Backend' },
      { slug: 'sql-indexing-transactions', name: 'Database Indexing & ACID', category: 'Databases' },
      { slug: 'auth-security-tokens', name: 'Auth & Session Tokens', category: 'Security' },
    ],
    modulesCount: 22,
    questionsCount: 48,
    recommendedWeeklyHours: 12,
  },
  {
    slug: 'ai-machine-learning',
    title: 'AI & Machine Learning Track',
    tagline: 'Practical machine learning, LLM system architecture, RAG, and agentic workflows.',
    description: 'From core classification and regression to production embeddings, vector retrieval, structured outputs, and evaluation harnesses.',
    hoursMin: 32,
    hoursMax: 50,
    difficultyLevel: 'Advanced',
    domains: ['ML Foundations', 'Deep Learning', 'LLMs & RAG', 'AI Engineering'],
    skills: [
      { slug: 'supervised-evaluation', name: 'Model Evaluation & AUC/ROC', category: 'ML' },
      { slug: 'embeddings-vector-search', name: 'Embeddings & Vector Search', category: 'LLM' },
      { slug: 'rag-chunking-grounding', name: 'RAG Chunking & Grounding', category: 'LLM' },
      { slug: 'agentic-state-machines', name: 'Agent Workflows & Tool Calling', category: 'AI' },
    ],
    modulesCount: 18,
    questionsCount: 38,
    recommendedWeeklyHours: 10,
  },
];

export const SAMPLE_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'sql-retention-01',
    title: 'Monthly User Retention Rate Calculation',
    trackSlug: 'data-analyst',
    domain: 'SQL & Databases',
    skillSlug: 'retention-cohorts',
    difficulty: 3,
    cognitiveDemand: 'analysis',
    questionType: 'sql_coding',
    prompt: 'Write a PostgreSQL query to calculate Month 1 Retention for users signed up in January 2026. A user is retained in Month 1 if they performed at least one activity in February 2026.',
    datasetContext: `Table: users
- user_id (INT)
- signup_date (DATE)

Table: activity_log
- event_id (INT)
- user_id (INT)
- event_date (DATE)`,
    codeTemplate: `SELECT
  COUNT(DISTINCT u.user_id) AS cohort_size,
  COUNT(DISTINCT a.user_id) AS retained_users,
  ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT u.user_id), 2) AS retention_rate_pct
FROM users u
LEFT JOIN activity_log a
  ON u.user_id = a.user_id
  AND a.event_date >= '2026-02-01' AND a.event_date < '2026-03-01'
WHERE u.signup_date >= '2026-01-01' AND u.signup_date < '2026-02-01';`,
    expectedOutputHint: 'cohort_size: 1200 | retained_users: 480 | retention_rate_pct: 40.00',
    explanation: 'Cohort retention begins by defining the base population (users signed up in January). A LEFT JOIN against activities in the target month retains all cohort users even if they had zero events, enabling an exact percentage calculation.',
    hints: [
      'Filter the base table users on signup_date >= "2026-01-01" AND signup_date < "2026-02-01".',
      'Use a LEFT JOIN on activity_log to avoid dropping cohort members who did not return.',
      'Multiply by 100.0 before dividing to avoid integer truncation in PostgreSQL.',
    ],
  },
  {
    id: 'sql-window-rank-02',
    title: 'Top 2 Revenue Generating Products Per Category',
    trackSlug: 'data-analyst',
    domain: 'SQL & Databases',
    skillSlug: 'window-functions',
    difficulty: 3,
    cognitiveDemand: 'application',
    questionType: 'sql_coding',
    prompt: 'Using a CTE and DENSE_RANK(), retrieve the top 2 products with the highest total sales amount within each product category.',
    datasetContext: `Table: sales_transactions
- transaction_id (INT)
- product_id (INT)
- category (VARCHAR)
- sale_amount (NUMERIC)`,
    codeTemplate: `WITH ranked_products AS (
  SELECT
    category,
    product_id,
    SUM(sale_amount) AS total_revenue,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY SUM(sale_amount) DESC) AS rank_pos
  FROM sales_transactions
  GROUP BY category, product_id
)
SELECT category, product_id, total_revenue, rank_pos
FROM ranked_products
WHERE rank_pos <= 2
ORDER BY category, rank_pos;`,
    expectedOutputHint: 'Includes category, product_id, total_revenue, rank_pos (<= 2)',
    explanation: 'Window functions like DENSE_RANK() cannot be evaluated in the WHERE clause of the same query block because window calculations occur after GROUP BY and HAVING. Placing the aggregate in a CTE allows downstream filtering.',
    hints: [
      'Group by category and product_id to aggregate sales first.',
      'Apply DENSE_RANK() PARTITION BY category ORDER BY SUM(sale_amount) DESC.',
      'Filter rank_pos <= 2 in the outer query.',
    ],
  },
  {
    id: 'metric-diagnosis-01',
    title: 'E-commerce Checkout Funnel Drop-off Diagnostic',
    trackSlug: 'data-analyst',
    domain: 'Metrics & BI',
    skillSlug: 'ab-testing-metrics',
    difficulty: 2,
    cognitiveDemand: 'analysis',
    questionType: 'metric_diagnosis',
    prompt: 'During week 42, checkout conversion fell by 18% while cart additions grew by 12%. Page traffic, product prices, and promotion codes remained constant. Which factor should you investigate first?',
    options: [
      'Top-of-funnel marketing channel mix shift to low-intent ad campaigns',
      'Payment gateway API error rate or latency spike on step 3',
      'Seasonal variation in user search query volume',
      'Database index fragmentation on product catalog reviews',
    ],
    correctOptionIndex: 1,
    explanation: 'Since cart adds increased by 12%, user intent and top-of-funnel attraction remained strong. A sharp drop between cart addition and final checkout without pricing changes strongly points to friction or failure at the payment step (gateway errors, field validation bugs).',
    hints: [
      'Notice that cart additions actually rose, ruling out early-funnel drop-off.',
      'Friction between cart and purchase is usually technical (payment failure) or UX friction.',
    ],
  },
  {
    id: 'ba-moscow-01',
    title: 'MoSCoW Prioritization for Payment Integration',
    trackSlug: 'business-analyst',
    domain: 'Requirements Engineering',
    skillSlug: 'brd-user-stories',
    difficulty: 2,
    cognitiveDemand: 'understanding',
    questionType: 'mcq',
    prompt: 'In an MVP release for a cross-border remittance portal, which of the following is strictly a "Must Have" requirement under MoSCoW rules?',
    options: [
      'Cryptocurrency payout option for international receivers',
      'Real-time AML and OFAC sanctions screening prior to fund disbursement',
      'Personalized biometric dashboard themes',
      'Social referral credit sharing via messaging apps',
    ],
    correctOptionIndex: 1,
    explanation: 'Compliance with anti-money laundering (AML) and sanctions regulations is a mandatory legal constraint without which the product cannot legally operate. It is a non-negotiable Must Have.',
    hints: [
      'Consider legal and operational viability of the financial product.',
      'A feature is Must Have if omitting it makes the release illegal or non-viable.',
    ],
  },
  {
    id: 'fullstack-react-01',
    title: 'Optimistic UI Updates with Rollback on Network Failure',
    trackSlug: 'full-stack-dev',
    domain: 'Frontend Architecture',
    skillSlug: 'react-state-architecture',
    difficulty: 3,
    cognitiveDemand: 'application',
    questionType: 'mcq',
    prompt: 'When implementing optimistic task completion in a multi-device synced app, what is the best practice for handling temporary offline or network failure?',
    options: [
      'Block the entire screen with a modal spinner until the server returns 200 OK',
      'Apply the update locally immediately, retain a snapshot of previous state, and revert with a retry snackbar if the server rejects the write',
      'Discard user modifications silently and reload the browser window',
      'Write the task directly to browser cookies and ignore server errors',
    ],
    correctOptionIndex: 1,
    explanation: 'Optimistic mutations update client state immediately to provide zero-latency interaction. Retaining the prior snapshot ensures reliable rollback and actionable feedback if network or validation errors occur.',
    hints: [
      'Look for the pattern that maintains responsiveness while guaranteeing data integrity.',
    ],
  },
];

export const INITIAL_TASKS_TEMPLATE: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Complete Monthly User Retention SQL Lab',
    description: 'Solve the cohort retention query using LEFT JOIN and calculate Month 1 return rates.',
    status: 'in_progress',
    priority: 'urgent',
    category: 'coding_practice',
    trackSlug: 'data-analyst',
    estimatedMinutes: 25,
    actualMinutes: 10,
    dueDate: '2026-10-05',
  },
  {
    title: 'Review E-commerce Drop-off Metric Case',
    description: 'Diagnose the 18% checkout conversion drop and prepare actionable recommendation.',
    status: 'todo',
    priority: 'high',
    category: 'roadmap_study',
    trackSlug: 'data-analyst',
    estimatedMinutes: 20,
    dueDate: '2026-10-05',
  },
  {
    title: 'Practice 10 Spaced Repetition Review Cards',
    description: 'Clear the due review queue for window functions and MoSCoW prioritization.',
    status: 'todo',
    priority: 'medium',
    category: 'revision',
    trackSlug: 'data-analyst',
    estimatedMinutes: 15,
    dueDate: '2026-10-06',
  },
  {
    title: 'Log 45-minute Deep Focus Study Session',
    description: 'Focus block on Database Indexing and ACID transaction properties.',
    status: 'completed',
    priority: 'high',
    category: 'roadmap_study',
    trackSlug: 'full-stack-dev',
    estimatedMinutes: 45,
    actualMinutes: 45,
    dueDate: '2026-10-04',
    completedAt: '2026-10-04T18:30:00Z',
  },
  {
    title: 'Sync Workstation with Mobile Applet Presence',
    description: 'Verify live Firestore onSnapshot task synchronization across laptop and mobile view.',
    status: 'completed',
    priority: 'urgent',
    category: 'general',
    estimatedMinutes: 10,
    actualMinutes: 8,
    dueDate: '2026-10-04',
    completedAt: '2026-10-04T19:00:00Z',
  },
];
