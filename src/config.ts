export const config = {
  MCP_HTTP_PORT: parseInt(process.env.MCP_HTTP_PORT || process.env.PORT || "8000", 10),
};
