export enum PostType {
  LINK = "link",
  TEXT = "text",
  GALLERY = "gallery",
  MEDIA = "media",
  UNKNOWN = "unknown",
}

export interface Post {
  id: string;
  title: string;
  author: string;
  score: number;
  subreddit: string;
  url: string;
  created_at: string;
  comment_count: number;
  post_type: PostType;
  content: string | null;
}

export interface Comment {
  id: string;
  author: string;
  body: string;
  score: number;
  replies: Comment[];
}

export interface SubredditInfo {
  name: string;
  subscriber_count: number;
  description: string | null;
}

export interface PostDetail {
  post: Post;
  comments: Comment[];
}
