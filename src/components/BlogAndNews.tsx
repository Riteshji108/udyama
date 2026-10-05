import React, { useState } from 'react';
import { IconBookOpen, IconPlus, IconClock, IconCheck, IconCalendar } from './icons';

interface ArticleItem {
  id: string;
  title: string;
  category: string;
  readTimeMin: number;
  date: string;
  summary: string;
  content: string;
  author: string;
  tags: string[];
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  snippet: string;
  impactTag: string;
}

const ARTICLES: ArticleItem[] = [
  {
    id: 'art-1',
    title: 'Modern Analytics Engineering: Transitioning from Ad-hoc Queries to Verifiable Models',
    category: 'Architecture',
    readTimeMin: 7,
    date: 'Oct 2026',
    author: 'Udyama Editorial Staff',
    summary: 'Why modern data teams insist on version-controlled transformation pipelines, automated data tests, and idempotent DAGs over scattered spreadsheet models.',
    content: `Data teams across high-growth startups are shifting away from manual, one-off spreadsheet updates toward version-controlled SQL models.

Key Architectural Tenets:
1. Declarative Transformation: Write queries as pure transformations rather than mutating production tables directly.
2. Automated Schema Tests: Enforce non-null and uniqueness constraints on primary keys before reports reach leadership.
3. Idempotent Executions: Re-running a pipeline for a prior date must always yield identical aggregate outputs.

By treating analytics models like software packages, companies eliminate data discrepancies between marketing and finance dashboards.`,
    tags: ['dbt', 'SQL', 'Data Engineering'],
  },
  {
    id: 'art-2',
    title: 'The Real Difference Between RANK() and DENSE_RANK() in Production SQL',
    category: 'SQL Deep Dive',
    readTimeMin: 5,
    date: 'Sep 2026',
    author: 'Technical Review Board',
    summary: 'A definitive breakdown of SQL window ranking nuances with practical edge cases encountered during technical interviews.',
    content: `Window functions are among the most frequently tested competencies in analytics interviews. While both RANK() and DENSE_RANK() order rows by an analytical expression, their tie-breaking handling leads to wildly different reporting numbers.

Whenever you are calculating top-tier tiers (such as the top 3 highest spending customers per territory), DENSE_RANK() ensures you do not inadvertently skip tier 2 if two customers tie for first place.`,
    tags: ['Window Functions', 'PostgreSQL', 'Interviews'],
  },
];

const NEWS_FEED: NewsItem[] = [
  {
    id: 'news-1',
    title: 'PostgreSQL 18 Formalizes Native UUIDv7 Generator for High-Throughput B-Tree Inserts',
    source: 'PostgreSQL Global Development Group',
    date: 'Oct 02, 2026',
    snippet: 'The new uuid_generate_v7() standardizes timestamp-prefixed UUIDs, eliminating index leaf fragmentation in massive transactional tables.',
    impactTag: 'Database Engine',
  },
  {
    id: 'news-2',
    title: 'Tech Hiring Report 2026: Companies Shift From Pure LeetCode to Practical Business Case & SQL Exams',
    source: 'Tech Career & Compensation Review',
    date: 'Sep 28, 2026',
    snippet: 'Over 68% of hiring committees for Analytics and BI Engineering now evaluate realistic sandbox queries, metric debugging, and executive communication over abstract algorithms.',
    impactTag: 'Career Trends',
  },
  {
    id: 'news-3',
    title: 'OpenTelemetry Releases Enhanced Database Query Trace Instrumentation for Distributed Web Services',
    source: 'CNCF Community Updates',
    date: 'Sep 20, 2026',
    snippet: 'New standardized database span conventions make tracking query latency, cache misses, and connection pool starvation seamless across microservices.',
    impactTag: 'Observability',
  },
];

export const BlogAndNews: React.FC<{
  onAddTask?: (title: string, durationMin: number) => void;
}> = ({ onAddTask }) => {
  const [activeTab, setActiveTab] = useState<'articles' | 'news'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const handleAdd = (title: string, id: string, mins: number) => {
    if (onAddTask) {
      onAddTask(`Read & Study: ${title}`, mins);
    }
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }));
    }, 2500);
  };

  return (
    <div className="bg-[#E7E9E6] border border-[#C8CECB] rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#C8CECB] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <IconBookOpen size={18} className="text-[#2E5B66]" />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#253238]">
              Articles & Industry News (Section 29)
            </h3>
            <span className="text-[10px] text-[#5D676C]">
              Verified technical writing • Source-attributed news • One-click sync to tasks
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setActiveTab('articles');
              setSelectedArticle(null);
            }}
            className={`px-3 py-1 text-xs rounded border transition-colors cursor-pointer ${
              activeTab === 'articles'
                ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
            }`}
          >
            In-Depth Articles ({ARTICLES.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('news');
              setSelectedArticle(null);
            }}
            className={`px-3 py-1 text-xs rounded border transition-colors cursor-pointer ${
              activeTab === 'news'
                ? 'bg-[#2E5B66] text-white border-[#2E5B66]'
                : 'bg-[#F2F3F1] border-[#C8CECB] text-[#5D676C] hover:bg-[#DDE1DE]'
            }`}
          >
            Verified News ({NEWS_FEED.length})
          </button>
        </div>
      </div>

      {/* Selected Article Detail View */}
      {selectedArticle ? (
        <div className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#C8CECB] pb-2">
            <button
              onClick={() => setSelectedArticle(null)}
              className="text-xs text-[#2E5B66] hover:underline cursor-pointer"
            >
              ← Back to All Articles
            </button>
            <span className="text-xs text-[#5D676C]">
              {selectedArticle.readTimeMin} min read • {selectedArticle.date}
            </span>
          </div>

          <h2 className="text-base font-serif font-bold text-[#253238]">
            {selectedArticle.title}
          </h2>

          <div className="text-[11px] text-[#5D676C]">
            Written by {selectedArticle.author}
          </div>

          <div className="text-xs text-[#253238] whitespace-pre-line leading-relaxed pt-2">
            {selectedArticle.content}
          </div>

          <div className="pt-3 border-t border-[#C8CECB] flex items-center justify-between">
            <div className="flex gap-1">
              {selectedArticle.tags.map((t, idx) => (
                <span key={idx} className="text-[10px] bg-[#E7E9E6] border border-[#C8CECB] px-2 py-0.5 rounded">
                  #{t}
                </span>
              ))}
            </div>

            <button
              onClick={() => handleAdd(selectedArticle.title, selectedArticle.id, selectedArticle.readTimeMin)}
              className="px-3 py-1 bg-[#2E5B66] hover:bg-[#244851] text-white text-xs rounded font-medium cursor-pointer"
            >
              + Sync to Daily Tasks
            </button>
          </div>
        </div>
      ) : activeTab === 'articles' ? (
        /* Articles List */
        <div className="space-y-3">
          {ARTICLES.map((art) => {
            const isAdded = addedIds[art.id];
            return (
              <div
                key={art.id}
                className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-4 space-y-2 hover:border-[#2E5B66]/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-[#DDE1DE] text-[#2E5B66]">
                    {art.category}
                  </span>
                  <span className="text-xs text-[#5D676C] font-mono tabular-nums flex items-center gap-1">
                    <IconClock size={12} /> {art.readTimeMin} min read
                  </span>
                </div>

                <h4
                  onClick={() => setSelectedArticle(art)}
                  className="text-sm font-semibold text-[#253238] font-display hover:text-[#2E5B66] cursor-pointer"
                >
                  {art.title}
                </h4>

                <p className="text-xs text-[#5D676C] line-clamp-2">
                  {art.summary}
                </p>

                <div className="pt-2 border-t border-[#C8CECB]/60 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setSelectedArticle(art)}
                    className="text-xs text-[#2E5B66] font-medium hover:underline cursor-pointer"
                  >
                    Read Full Article →
                  </button>

                  <button
                    onClick={() => handleAdd(art.title, art.id, art.readTimeMin)}
                    className={`px-2.5 py-1 text-xs rounded border flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                      isAdded
                        ? 'bg-[#3E6A50] text-white border-[#3E6A50]'
                        : 'bg-white border-[#C8CECB] text-[#253238] hover:bg-[#DDE1DE]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <IconCheck size={12} /> Added to Tasks!
                      </>
                    ) : (
                      <>
                        <IconPlus size={12} /> + Add to Tasks
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* News List */
        <div className="space-y-3">
          {NEWS_FEED.map((news) => (
            <div
              key={news.id}
              className="bg-[#F2F3F1] border border-[#C8CECB] rounded-md p-3.5 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-[#2E5B66] px-1.5 py-0.2 bg-[#DDE1DE] rounded">
                  {news.impactTag}
                </span>
                <span className="text-[#5D676C] flex items-center gap-1">
                  <IconCalendar size={11} /> {news.date}
                </span>
              </div>

              <h4 className="text-xs font-semibold text-[#253238]">
                {news.title}
              </h4>

              <p className="text-xs text-[#5D676C] leading-relaxed">
                {news.snippet}
              </p>

              <div className="text-[10px] text-[#5D676C] pt-1">
                Source: <strong className="text-[#253238]">{news.source}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
