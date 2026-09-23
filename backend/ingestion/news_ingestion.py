import os
from newsapi import NewsApiClient
from dotenv import load_dotenv

load_dotenv()


news_client = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))


MISINFORMATION_KEYWORDS = [
    "vaccine", "covid", "5G", "conspiracy", "hoax",
    "fake news", "miracle cure", "government hiding",
    "they dont want you to know", "banned", "censored",
    "election fraud", "deep state", "chemtrails"
]


# Languages requested from NewsAPI. Hindi ("hi") is supported by the API;
# Marathi is not, so Marathi content is sourced from the RSS feeds instead.
# Override with NEWS_LANGUAGES=en,hi in backend/.env.
NEWS_LANGUAGES = [
    code.strip()
    for code in os.getenv("NEWS_LANGUAGES", "en,hi").split(",")
    if code.strip()
]


def fetch_news_articles(max_articles: int = 20) -> list[dict]:
    """
    Fetch news articles related to misinformation topics.
    Returns a list of post dicts ready for the pipeline.
    """

    all_articles = []

    for keyword in MISINFORMATION_KEYWORDS[:5]:
      for lang_code in NEWS_LANGUAGES:
        try:
            response = news_client.get_everything(
                q=keyword,
                language=lang_code,
                sort_by="publishedAt",
                page_size=5
            )

            articles = response.get("articles", [])

            for article in articles:
                title = article.get("title", "")
                description = article.get("description", "")

                if not title or title == "[Removed]":
                    continue

                text = f"{title}. {description}" if description else title

                all_articles.append({
                    "text": text,
                    "source": "newsapi",
                    "platform": "news",
                    "url": article.get("url", ""),
                    "author": article.get("author", "unknown"),
                    "published_at": article.get("publishedAt", "")
                })

        except Exception as e:
            print(f"NewsAPI error for keyword '{keyword}': {e}")
            continue

    print(f"NewsAPI: fetched {len(all_articles)} articles")
    return all_articles