// News-based filter
export function newsImpactFilter(newsItems) {
  const keywords = ["CPI", "inflation", "Fed", "interest rates", "policy"];
  const relevantNews = newsItems.filter(n =>
    keywords.some(k => n.title.toLowerCase().includes(k.toLowerCase()))
  );

  if (relevantNews.length > 0) {
    return {
      signal: "CAUTION",
      reason: `Upcoming/Recent news may cause volatility: ${relevantNews[0].title}`
    };
  }

  return { signal: "CLEAR", reason: "No major market-moving news detected" };
}
