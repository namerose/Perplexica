# Tavily Search Engine Integration

Perplexica now supports Tavily Search API, which provides more relevant and AI-optimized search results alongside the existing SearxNG search engine.

## Getting a Tavily API Key

1. Visit [https://tavily.com/](https://tavily.com/) and sign up for an account
2. Navigate to the API section in your dashboard
3. Generate a new API key
4. Copy the API key for configuration

## Configuration

You can configure the Tavily API key in two ways:

### 1. Environment Variable

Set the `TAVILY_API_KEY` environment variable before starting the application:

```bash
# For Linux/Mac
export TAVILY_API_KEY=your-api-key-here

# For Windows PowerShell
$env:TAVILY_API_KEY="your-api-key-here"

# For Windows CMD
set TAVILY_API_KEY=your-api-key-here
```

### 2. Configuration File

Add the Tavily API key to your `config.toml` file:

```toml
[MODELS.TAVILY]
API_KEY = "your-api-key-here"
```

## Using the Tavily Search Engine

You can now choose between three search options:
- **SearxNG**: Uses the original SearxNG search engine
- **Tavily**: Uses the Tavily AI-optimized search API
- **Combined**: Uses both search engines to provide more comprehensive results

Select your preferred search engine from the Focus dropdown in the chat interface.

## Image Search Integration

The Tavily search integration also supports image search capabilities. When using the "Search images" button in chat:

- In SearxNG mode: Images are fetched from traditional search engines (Google Images, Bing Images)
- In Tavily mode: Images are fetched using Tavily's AI-optimized image search
- In Combined mode: Images are fetched from both sources and combined for more comprehensive results

The system automatically passes your current search mode to the image search functionality, ensuring consistency throughout your search experience.

## Adaptive Search Intelligence

The Tavily integration has been enhanced with adaptive intelligence that automatically tailors search parameters based on the complexity and nature of user queries:

### Dynamic Result Count
The system analyzes each query and automatically adjusts the number of search results (from 5 to 20) based on:
- Query length and complexity
- Presence of comparison or list terms
- Technical subject matter
- Question complexity

### Smart Search Depth Selection
The system automatically switches between "basic" and "deep" search modes depending on:
- Query sophistication
- Need for comprehensive analysis
- Technical or academic subject matter
- Query length and complexity

This adaptive approach ensures that simple queries receive quick, concise responses while complex questions trigger more thorough research, providing optimal results without requiring manual configuration.

## Troubleshooting

If you encounter errors when using the Tavily search integration, here are some common issues and solutions:

### 400 Bad Request Error

If you see an error like `Tavily search error: Error: Request failed with status code 400`, this could be due to:

1. **Invalid API Key**: Verify that your Tavily API key is correct. You can check this in your Tavily dashboard.
2. **Rate Limiting**: You may have exceeded your Tavily API rate limits. Check your usage in the Tavily dashboard.
3. **Malformed Query**: Some special characters or extremely long queries may cause issues.

### No Results Returned

If searches are returning no results:

1. **API Key Not Configured**: Ensure your API key is properly configured in the config.toml file or as an environment variable.
2. **Network Issues**: Check your internet connection and ensure your application can access external APIs.
3. **Query Too Specific**: Try using more general search terms.

### Configuration Testing

You can test if your Tavily configuration is working correctly by selecting the "Tavily" search option from the Focus dropdown and entering a simple search query like "latest news" or "weather today".
