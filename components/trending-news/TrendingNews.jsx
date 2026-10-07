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
    <div className="min-h-screen bg-[#fbfbf9] dark:bg-[#0c0e14]">
      <Navbar />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10 pb-8">
        <div className="pt-4">
          <h1 className="text-[28px] font-bold leading-none text-[#1a1a2e] dark:text-white">
            Trending News
          </h1>
          <p className="mt-[4px] text-[16px] leading-none text-[#6b7280] dark:text-[#9ca3af]">
            Latest startup funding, market trends, and AI-generated summaries.
          </p>
        </div>

        <div className="mt-[24px]">
          <CategoryTabs
            activeCategory={activeCategory}
            onSelectCategory={(cat) => setActiveCategory(cat)}
          />
        </div>

        <h2 className="mt-[28px] text-[18px] font-semibold leading-none text-[#1a1a2e] dark:text-white">
          {activeCategory === "All" ? "Featured Stories" : `${activeCategory} News`}
        </h2>

        {loading ? (
          <div className="mt-[20px] grid grid-cols-1 gap-[20px] xl:grid-cols-2">
            <div className="h-[200px] animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c202e]" />
            <div className="h-[200px] animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c202e]" />
          </div>
        ) : (
          <div className="mt-[20px] grid grid-cols-1 gap-[20px] xl:grid-cols-2">
            {resolved.featured.map((article) => (
              <FeaturedCard key={article.id} {...article} />
            ))}
          </div>
        )}

        <h2 className="mt-[24px] text-[18px] font-semibold leading-none text-[#1a1a2e] dark:text-white">
          Latest
        </h2>

        {loading ? (
          <div className="mt-[20px] space-y-[20px]">
            <div className="h-[90px] animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c202e]" />
            <div className="h-[90px] animate-pulse rounded-xl bg-gray-100 dark:bg-[#1c202e]" />
          </div>
        ) : (
          <div className="mt-[20px] space-y-[20px]">
            {resolved.latest.map((article) => (
              <NewsListItem key={article.id} {...article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
