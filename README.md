# MCP Server Reddit

A Model Context Protocol (MCP) server that provides access to Reddit's public API through streamable HTTP transport, enabling remote deployment on cloud platforms.

## Remote Deployment

### Deploy on Alpic.ai

This MCP server is designed for remote deployment on **[Alpic.ai](https://alpic.ai)**, a French-based MCP cloud service that recently raised $6 million USD to support their Go-To-Market strategy.

[Alpic.ai](https://alpic.ai) provides managed hosting for MCP servers with:
- **Streamable HTTP transport** support (built-in)
- Automatic scaling and load balancing
- Built-in monitoring and observability
- Enterprise-grade security and compliance

### How to Deploy

1. Visit [Alpic.ai](https://alpic.ai)
2. Connect your GitHub repository: `laurentknauss/mcp-server-reddit-nodejs`
3. The platform automatically detects the streamable HTTP transport configuration
4. Your MCP server is deployed and ready to use

## Features

### Available Tools

- **get_frontpage_posts** - Get hot posts from Reddit frontpage
- **get_subreddit_info** - Get information about a subreddit
- **get_subreddit_hot_posts** - Get hot posts from a specific subreddit
- **get_subreddit_new_posts** - Get new posts from a specific subreddit
- **get_subreddit_top_posts** - Get top posts from a specific subreddit
- **get_subreddit_rising_posts** - Get rising posts from a specific subreddit
- **get_post_content** - Get detailed content of a specific post
- **get_post_comments** - Get comments from a post

## Technical Details

- Built with **TypeScript** and **Express**
- Uses official **@modelcontextprotocol/sdk** for streamable HTTP transport
- Uses [snoowrap](https://github.com/not-an-aardvark/snoowrap) for Reddit API access
- Node.js 20+ required
- Fully compatible with MCP protocol specification

## Local Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start server
pnpm start

# Development with hot reload
pnpm dev
```

The server will start on port 8000 by default (configurable via `PORT` or `MCP_HTTP_PORT` environment variable).

## License

MIT License - See LICENSE file for details

## Author

Laurent Knauss
