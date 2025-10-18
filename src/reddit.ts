import Snoowrap from "snoowrap";
import { Post, Comment, SubredditInfo, PostType, PostDetail } from "./types.js";

// Create Reddit client with user agent (no authentication needed for public API)
const reddit = new Snoowrap({
  userAgent: "mcp-server-reddit/0.2.0",
  clientId: "",
  clientSecret: "",
  refreshToken: "",
});

// Disable warnings for missing credentials (we're using public API only)
reddit.config({ warnings: false, requestDelay: 1000 });

function getPostType(submission: any): PostType {
  if (submission.is_video) return PostType.MEDIA;
  if (submission.is_gallery) return PostType.GALLERY;
  if (submission.is_self) return PostType.TEXT;
  if (submission.url) return PostType.LINK;
  return PostType.UNKNOWN;
}

function getPostContent(submission: any): string | null {
  if (submission.is_self && submission.selftext) {
    return submission.selftext;
  }
  if (submission.url) {
    return submission.url;
  }
  return null;
}

function buildPost(submission: any): Post {
  return {
    id: submission.id,
    title: submission.title,
    author: submission.author?.name || "[deleted]",
    score: submission.score || 0,
    subreddit: submission.subreddit?.display_name || "unknown",
    url: `https://reddit.com${submission.permalink}`,
    created_at: new Date(submission.created_utc * 1000).toISOString(),
    comment_count: submission.num_comments || 0,
    post_type: getPostType(submission),
    content: getPostContent(submission),
  };
}

function buildComment(comment: any, depth: number = 3): Comment | null {
  if (depth <= 0 || !comment || typeof comment === "string") return null;

  const replies: Comment[] = [];
  if (comment.replies && Array.isArray(comment.replies)) {
    for (const reply of comment.replies) {
      const childComment = buildComment(reply, depth - 1);
      if (childComment) {
        replies.push(childComment);
      }
    }
  }

  return {
    id: comment.id || "unknown",
    author: comment.author?.name || "[deleted]",
    body: comment.body || "",
    score: comment.score || 0,
    replies,
  };
}

export async function getFrontpagePosts(limit: number = 10): Promise<Post[]> {
  const submissions = await reddit.getHot({ limit });
  return submissions.map(buildPost);
}

export async function getSubredditInfo(subredditName: string): Promise<SubredditInfo> {
  const subreddit = await reddit.getSubreddit(subredditName).fetch();
  return {
    name: subreddit.display_name,
    subscriber_count: subreddit.subscribers || 0,
    description: subreddit.public_description || null,
  };
}

export async function getSubredditHotPosts(
  subredditName: string,
  limit: number = 10
): Promise<Post[]> {
  const submissions = await reddit.getSubreddit(subredditName).getHot({ limit });
  return submissions.map(buildPost);
}

export async function getSubredditNewPosts(
  subredditName: string,
  limit: number = 10
): Promise<Post[]> {
  const submissions = await reddit.getSubreddit(subredditName).getNew({ limit });
  return submissions.map(buildPost);
}

export async function getSubredditTopPosts(
  subredditName: string,
  limit: number = 10,
  time: string = ""
): Promise<Post[]> {
  const timeFilter = time as any;
  const submissions = await reddit
    .getSubreddit(subredditName)
    .getTop({ limit, time: timeFilter || undefined });
  return submissions.map(buildPost);
}

export async function getSubredditRisingPosts(
  subredditName: string,
  limit: number = 10
): Promise<Post[]> {
  const submissions = await reddit.getSubreddit(subredditName).getRising({ limit });
  return submissions.map(buildPost);
}

export async function getPostContent(
  postId: string,
  commentLimit: number = 10,
  commentDepth: number = 3
): Promise<PostDetail> {
  const submission = await reddit.getSubmission(postId).fetch();
  const post = buildPost(submission);

  // Expand comments
  await submission.expandReplies({ limit: commentLimit, depth: commentDepth });

  const comments: Comment[] = [];
  if (submission.comments && Array.isArray(submission.comments)) {
    for (const comment of submission.comments.slice(0, commentLimit)) {
      const builtComment = buildComment(comment, commentDepth);
      if (builtComment) {
        comments.push(builtComment);
      }
    }
  }

  return { post, comments };
}

export async function getPostComments(
  postId: string,
  limit: number = 10
): Promise<Comment[]> {
  const submission = await reddit.getSubmission(postId).fetch();
  await submission.expandReplies({ limit, depth: 3 });

  const comments: Comment[] = [];
  if (submission.comments && Array.isArray(submission.comments)) {
    for (const comment of submission.comments.slice(0, limit)) {
      const builtComment = buildComment(comment);
      if (builtComment) {
        comments.push(builtComment);
      }
    }
  }

  return comments;
}
