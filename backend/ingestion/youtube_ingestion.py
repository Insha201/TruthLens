import os
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

MISINFORMATION_KEYWORDS = [
    "vaccine side effects truth",
    "covid conspiracy",
    "election fraud proof",
    "government hiding cure",
    "5G danger",
    "fake news exposed",
    "chemtrails proof",
    "miracle cure cancer"
]


def fetch_youtube_videos(max_videos: int = 20) -> list[dict]:
    """
    Fetch YouTube video titles and descriptions
    related to misinformation topics.
    Returns a list of post dicts ready for the pipeline.
    """

    all_videos = []

    for keyword in MISINFORMATION_KEYWORDS[:4]:
        try:
            response = youtube.search().list(
                q=keyword,
                part="snippet",
                type="video",
                maxResults=5,
                relevanceLanguage="en",
                safeSearch="none"
            ).execute()

            items = response.get("items", [])

            for item in items:
                snippet = item.get("snippet", {})
                title = snippet.get("title", "")
                description = snippet.get("description", "")
                video_id = item.get("id", {}).get("videoId", "")

                if not title:
                    continue

                text = f"{title}. {description[:200]}" if description else title

                all_videos.append({
                    "text": text,
                    "source": "youtube",
                    "platform": "youtube",
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "author": snippet.get("channelTitle", "unknown"),
                    "published_at": snippet.get("publishedAt", "")
                })

        except Exception as e:
            print(f"YouTube error for keyword '{keyword}': {e}")
            continue

    print(f"YouTube: fetched {len(all_videos)} videos")
    return all_videos


def fetch_youtube_comments(video_id: str, max_comments: int = 10) -> list[dict]:
    """
    Fetch comments from a specific YouTube video.
    Comments are a goldmine for misinformation spread.
    """

    comments = []

    try:
        response = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_comments,
            textFormat="plainText"
        ).execute()

        for item in response.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]
            text = comment.get("textDisplay", "")

            if not text:
                continue

            comments.append({
                "text": text,
                "source": "youtube_comment",
                "platform": "youtube",
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "author": comment.get("authorDisplayName", "unknown"),
                "published_at": comment.get("publishedAt", "")
            })

    except Exception as e:
        print(f"YouTube comments error for video '{video_id}': {e}")

    print(f"YouTube comments: fetched {len(comments)} comments")
    return comments