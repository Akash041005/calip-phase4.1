"use client";

import { useEffect, useState } from "react";
import Navbar from "../dashboard/Navbar";
import CategoryTabs from "./CategoryTabs";
import FeaturedCard from "./FeaturedCard";
import NewsListItem from "./NewsListItem";
import { getTrendingNews } from "../../lib/newsApi";

function normalizeArticle(article, index) {
  if (!article) return null;
  return {
    id: article.id || article._id || article.articleId || index,
    badge: article.badge || article.category || article.industrySector || "Funding",
    title: article.title || article.headline || "Untitled",
    description: article.description || article.summary || article.excerpt || "",
    time: article.time || article.publishedAt || "recent",
    readTime:
      article.readTime ||
      (article.readTimeMinutes
        ? `${article.readTimeMinutes} min read`
        : article.readingMinutes
        ? `${article.readingMinutes} min read`
        : "3 min read"),
    sourceName: article.sourceName,
    sourceUrl: article.sourceUrl,
    imageUrl: article.imageUrl,
  };
}

export default function TrendingNews() {
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getTrendingNews(activeCategory);
        if (cancelled) return;

        if (res?.success && res.data) {
          const payload = res.data;
          const feat = payload.featured ? normalizeArticle(payload.featured, "feat") : null;
          const rawArticles = Array.isArray(payload.articles) ? payload.articles : [];
          const normalizedArticles = rawArticles.map(normalizeArticle).filter(Boolean);

          let finalFeatured = [];
          let finalLatest = [];

          if (feat) {
            finalFeatured.push(feat);
            if (normalizedArticles.length > 0 && finalFeatured.length < 2) {
              finalFeatured.push(normalizedArticles[0]);
              finalLatest = normalizedArticles.slice(1);
            } else {
              finalLatest = normalizedArticles;
            }
          } else {
            finalFeatured = normalizedArticles.slice(0, 2);
            finalLatest = normalizedArticles.slice(2);
          }

          setData({
            featured: finalFeatured,
            latest: finalLatest,
          });
        } else if (Array.isArray(res)) {
          setData({
            featured: res.slice(0, 2).map(normalizeArticle),
            latest: res.slice(2).map(normalizeArticle),
          });
        }
      } catch (err) {
        console.warn("Could not load trending news:", err?.message || err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [activeCategory]);

  const resolved = data || {
    featured: [],
    latest: [],
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-[#f4f5fb]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(129,116,255,0.1)] border border-[rgba(129,116,255,0.2)] text-[12px] font-medium text-[#8174ff] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8174ff]" />
            ECOSYSTEM INTELLIGENCE
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Market Signals & Trends
          </h1>
          <p className="mt-1 text-sm text-[rgba(226,232,255,0.6)]">
            Latest startup rounds, token launches, and on-chain intelligence summaries.
          </p>
        </div>

        <div className="mb-6">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgba(226,232,255,0.7)]">
            {activeCategory === "All" ? "Featured Stories" : `${activeCategory} Signals`}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="h-[170px] animate-pulse rounded-2xl bg-[#111723]/60 border border-[rgba(226,232,255,0.06)]" />
            <div className="h-[170px] animate-pulse rounded-2xl bg-[#111723]/60 border border-[rgba(226,232,255,0.06)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {resolved.featured.map((article) => (
              <FeaturedCard key={article.id} {...article} />
            ))}
          </div>
        )}

        <div className="mt-8 mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[rgba(226,232,255,0.7)]">
            Latest Feed
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-[80px] animate-pulse rounded-2xl bg-[#111723]/60 border border-[rgba(226,232,255,0.06)]" />
            <div className="h-[80px] animate-pulse rounded-2xl bg-[#111723]/60 border border-[rgba(226,232,255,0.06)]" />
          </div>
        ) : (
          <div className="space-y-3">
            {resolved.latest.map((article) => (
              <NewsListItem key={article.id} {...article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
