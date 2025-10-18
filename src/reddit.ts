import { Post, Comment, SubredditInfo, PostType, PostDetail } from "./types.js";

const USER_AGENT = "mcp-server-reddit/0.2.0";

async function fetchReddit(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}

function getPostType(post: any): PostType {
  if (post.is_video) return PostType.MEDIA;
  if (post.is_gallery) return PostType.GALLERY;
  if (post.is_self) return PostType.TEXT;
  if (post.url) return PostType.LINK;
  return PostType.UNKNOWN;
}

function buildPost(post: any): Post {
  return {
    id: post.id,
    title: post.title,
    author: post.author || "[deleted]",
    score: post.score || 0,
    subreddit: post.subreddit || "unknown",
    url: `https://reddit.com${post.permalink}`,
    created_at: new Date(post.created_utc * 1000).toISOString(),
    comment_count: post.num_comments || 0,
    post_type: getPostType(post),
    content: post.is_self ? post.selftext : post.url,
  };
}

function buildComment(comment: any, depth: number = 3): Comment | null {
  if (depth <= 0 || !comment || comment.kind !== "t1") return null;

  const data = comment.data;
  const replies: Comment[] = [];

  if (data.replies && data.replies.data && data.replies.data.children) {
    for (const reply of data.replies.data.children) {
      const built = buildComment(reply, depth - 1);
      if (built) replies.push(built);
    }
  }

  return {
    id: data.id,
    author: data.author || "[deleted]",
    body: data.body || "",
    score: data.score || 0,
    replies,
  };
}

export async function getFrontpagePosts(limit: number = 10): Promise<Post[]> {
  const data = await fetchReddit(`https://www.reddit.com/.json?limit=${limit}`);
  return data.data.children.map((child: any) => buildPost(child.data));
}

export async function getSubredditInfo(
  subredditName: string,
): Promise<SubredditInfo> {
  const data = await fetchReddit(
    `https://www.reddit.com/r/${subredditName}/about.json`,
  );
  return {
    name: data.data.display_name,
    subscriber_count: data.data.subscribers || 0,
    description: data.data.public_description || null,
  };
}

export async function getSubredditHotPosts(
  subredditName: string,
  limit: number = 10,
): Promise<Post[]> {
  const data = await fetchReddit(
    `https://www.reddit.com/r/${subredditName}/hot.json?limit=${limit}`,
  );
  return data.data.children.map((child: any) => buildPost(child.data));
}

export async function getSubredditNewPosts(
  subredditName: string,
  limit: number = 10,
): Promise<Post[]> {
  const data = await fetchReddit(
    `https://www.reddit.com/r/${subredditName}/new.json?limit=${limit}`,
  );
  return data.data.children.map((child: any) => buildPost(child.data));
}

export async function getSubredditTopPosts(
  subredditName: string,
  limit: number = 10,
  time: string = "",
): Promise<Post[]> {
  const timeParam = time ? `&t=${time}` : "";
  const data = await fetchReddit(
    `https://www.reddit.com/r/${subredditName}/top.json?limit=${limit}${timeParam}`,
  );
  return data.data.children.map((child: any) => buildPost(child.data));
}

export async function getSubredditRisingPosts(
  subredditName: string,
  limit: number = 10,
): Promise<Post[]> {
  const data = await fetchReddit(
    `https://www.reddit.com/r/${subredditName}/rising.json?limit=${limit}`,
  );
  return data.data.children.map((child: any) => buildPost(child.data));
}

export async function getPostContent(
  postId: string,
  commentLimit: number = 10,
  commentDepth: number = 3,
): Promise<PostDetail> {
  const data = await fetchReddit(
    `https://www.reddit.com/comments/${postId}.json?limit=${commentLimit}&depth=${commentDepth}`,
  );
  const post = buildPost(data[0].data.children[0].data);
  const comments: Comment[] = [];

  if (data[1] && data[1].data && data[1].data.children) {
    for (const child of data[1].data.children.slice(0, commentLimit)) {
      const comment = buildComment(child, commentDepth);
      if (comment) comments.push(comment);
    }
  }

  return { post, comments };
}

export async function getPostComments(
  postId: string,
  limit: number = 10,
): Promise<Comment[]> {
  const data = await fetchReddit(
    `https://www.reddit.com/comments/${postId}.json?limit=${limit}&depth=3`,
  );
  const comments: Comment[] = [];

  if (data[1] && data[1].data && data[1].data.children) {
    for (const child of data[1].data.children.slice(0, limit)) {
      const comment = buildComment(child, 3);
      if (comment) comments.push(comment);
    }
  }

  return comments;
}
