import feedparser
from datetime import datetime


# All URLs below were health-checked and returning entries.
# Removed: Reuters (feed discontinued), Associated Press (rsshub proxy 403).
RSS_FEEDS = {
    "BBC News": "http://feeds.bbci.co.uk/news/rss.xml",
    "WHO": "https://www.who.int/rss-feeds/news-english.xml",
    "Times of India": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "NDTV": "https://feeds.feedburner.com/ndtvnews-top-stories",
    "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
    "The Guardian": "https://www.theguardian.com/world/rss",
    "NPR": "https://feeds.npr.org/1001/rss.xml",
    "Snopes": "https://www.snopes.com/feed/",
    "PolitiFact": "https://www.politifact.com/rss/factchecks/",
    "FactCheck": "https://www.factcheck.org/feed/",

    # ── Hindi ────────────────────────────────────────────────
    "BBC Hindi": "https://feeds.bbci.co.uk/hindi/rss.xml",
    "NDTV India": "https://feeds.feedburner.com/ndtvkhabar",
    "Amar Ujala": "https://www.amarujala.com/rss/breaking-news.xml",

    # ── Marathi ──────────────────────────────────────────────
    "BBC Marathi": "https://feeds.bbci.co.uk/marathi/rss.xml",
    "Maharashtra Times": "https://maharashtratimes.com/rssfeedstopstories.cms",
    "Loksatta": "https://www.loksatta.com/feed/",

    # ── Indian fact-checkers (Hindi + English) ───────────────
    "BOOM Live": "https://www.boomlive.in/feeds/feed.xml",
    "Factly": "https://factly.in/feed/",
    "Full Fact": "https://fullfact.org/feed/all/",
}


def fetch_rss_articles(max_per_feed: int = 5) -> list[dict]:
    """
    Fetch articles from RSS feeds of trusted news sources
    and fact checking websites.
    Returns a list of post dicts ready for the pipeline.
    """

    all_articles = []

    for source_name, feed_url in RSS_FEEDS.items():
        try:
            feed = feedparser.parse(feed_url)
            entries = feed.entries[:max_per_feed]

            for entry in entries:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                link = entry.get("link", "")

                if not title:
                    continue

                text = f"{title}. {summary[:300]}" if summary else title

                published_at = ""
                if hasattr(entry, "published"):
                    published_at = entry.published

                all_articles.append({
                    "text": text,
                    "source": source_name,
                    "platform": "rss",
                    "url": link,
                    "author": source_name,
                    "published_at": published_at
                })

        except Exception as e:
            print(f"RSS error for '{source_name}': {e}")
            continue

    print(f"RSS: fetched {len(all_articles)} articles")
    return all_articles