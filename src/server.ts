import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as reddit from "./reddit.js";

export function getServer(): Server {
  const server = new Server(
    {
      name: "mcp-server-reddit",
      version: "0.2.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_frontpage_posts",
        description: "Get hot posts from Reddit frontpage",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of posts to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
        },
      },
      {
        name: "get_subreddit_info",
        description: "Get information about a subreddit",
        inputSchema: {
          type: "object",
          properties: {
            subreddit_name: {
              type: "string",
              description: "Name of the subreddit (e.g. 'Python', 'news')",
            },
          },
          required: ["subreddit_name"],
        },
      },
      {
        name: "get_subreddit_hot_posts",
        description: "Get hot posts from a specific subreddit",
        inputSchema: {
          type: "object",
          properties: {
            subreddit_name: {
              type: "string",
              description: "Name of the subreddit (e.g. 'Python', 'news')",
            },
            limit: {
              type: "number",
              description: "Number of posts to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ["subreddit_name"],
        },
      },
      {
        name: "get_subreddit_new_posts",
        description: "Get new posts from a specific subreddit",
        inputSchema: {
          type: "object",
          properties: {
            subreddit_name: {
              type: "string",
              description: "Name of the subreddit (e.g. 'Python', 'news')",
            },
            limit: {
              type: "number",
              description: "Number of posts to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ["subreddit_name"],
        },
      },
      {
        name: "get_subreddit_top_posts",
        description: "Get top posts from a specific subreddit",
        inputSchema: {
          type: "object",
          properties: {
            subreddit_name: {
              type: "string",
              description: "Name of the subreddit (e.g. 'Python', 'news')",
            },
            limit: {
              type: "number",
              description: "Number of posts to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            time: {
              type: "string",
              description: "Time filter for top posts",
              enum: ["", "hour", "day", "week", "month", "year", "all"],
              default: "",
            },
          },
          required: ["subreddit_name"],
        },
      },
      {
        name: "get_subreddit_rising_posts",
        description: "Get rising posts from a specific subreddit",
        inputSchema: {
          type: "object",
          properties: {
            subreddit_name: {
              type: "string",
              description: "Name of the subreddit (e.g. 'Python', 'news')",
            },
            limit: {
              type: "number",
              description: "Number of posts to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ["subreddit_name"],
        },
      },
      {
        name: "get_post_content",
        description: "Get detailed content of a specific post",
        inputSchema: {
          type: "object",
          properties: {
            post_id: {
              type: "string",
              description: "ID of the post",
            },
            comment_limit: {
              type: "number",
              description: "Number of top-level comments to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            comment_depth: {
              type: "number",
              description: "Maximum depth of comment tree (default: 3, min: 1, max: 10)",
              default: 3,
              minimum: 1,
              maximum: 10,
            },
          },
          required: ["post_id"],
        },
      },
      {
        name: "get_post_comments",
        description: "Get comments from a post",
        inputSchema: {
          type: "object",
          properties: {
            post_id: {
              type: "string",
              description: "ID of the post",
            },
            limit: {
              type: "number",
              description: "Number of comments to return (default: 10, min: 1, max: 100)",
              default: 10,
              minimum: 1,
              maximum: 100,
            },
          },
          required: ["post_id"],
        },
      },
    ],
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "get_frontpage_posts": {
          const limit = (args?.limit as number) || 10;
          const posts = await reddit.getFrontpagePosts(limit);
          return {
            content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
          };
        }

        case "get_subreddit_info": {
          const subredditName = args?.subreddit_name as string;
          const info = await reddit.getSubredditInfo(subredditName);
          return {
            content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
          };
        }

        case "get_subreddit_hot_posts": {
          const subredditName = args?.subreddit_name as string;
          const limit = (args?.limit as number) || 10;
          const posts = await reddit.getSubredditHotPosts(subredditName, limit);
          return {
            content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
          };
        }

        case "get_subreddit_new_posts": {
          const subredditName = args?.subreddit_name as string;
          const limit = (args?.limit as number) || 10;
          const posts = await reddit.getSubredditNewPosts(subredditName, limit);
          return {
            content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
          };
        }

        case "get_subreddit_top_posts": {
          const subredditName = args?.subreddit_name as string;
          const limit = (args?.limit as number) || 10;
          const time = (args?.time as string) || "";
          const posts = await reddit.getSubredditTopPosts(subredditName, limit, time);
          return {
            content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
          };
        }

        case "get_subreddit_rising_posts": {
          const subredditName = args?.subreddit_name as string;
          const limit = (args?.limit as number) || 10;
          const posts = await reddit.getSubredditRisingPosts(subredditName, limit);
          return {
            content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
          };
        }

        case "get_post_content": {
          const postId = args?.post_id as string;
          const commentLimit = (args?.comment_limit as number) || 10;
          const commentDepth = (args?.comment_depth as number) || 3;
          const postDetail = await reddit.getPostContent(postId, commentLimit, commentDepth);
          return {
            content: [{ type: "text", text: JSON.stringify(postDetail, null, 2) }],
          };
        }

        case "get_post_comments": {
          const postId = args?.post_id as string;
          const limit = (args?.limit as number) || 10;
          const comments = await reddit.getPostComments(postId, limit);
          return {
            content: [{ type: "text", text: JSON.stringify(comments, null, 2) }],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  return server;
}
