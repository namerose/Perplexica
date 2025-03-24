import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { getTavilyApiKey } from './config';

interface TavilySearchOptions {
  maxResults?: number;
  includeRawContent?: boolean;
  includeImages?: boolean;
  searchDepth?: "basic" | "deep";
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  raw_content?: string | null;
  image_url?: string;
}

// Helper function to determine optimal result count based on query complexity
const determineResultCount = (query: string): number => {
  // Count words in the query as a simple complexity metric
  const wordCount = query.split(/\s+/).filter(Boolean).length;
  
  // Analyze query complexity
  const hasComplexTerms = /\b(compare|difference|versus|vs|analysis|comprehensive|detailed|explain|list|multiple|alternatives)\b/i.test(query);
  const hasTechnicalTerms = /\b(how|what|why|when|where|who|which|implement|code|tutorial|example|steps|guide)\b/i.test(query);
  
  // Start with base count
  let resultCount = 5;
  
  // Adjust based on complexity factors
  if (wordCount > 8) resultCount += 3;
  if (hasComplexTerms) resultCount += 5;
  if (hasTechnicalTerms) resultCount += 4;
  
  // Cap at maximum of 20 (Tavily API limit)
  return Math.min(Math.max(resultCount, 5), 20);
}

// Helper function to determine if query requires deep search
const needsDeepSearch = (query: string): boolean => {
  // Check for indicators that suggest need for more comprehensive search
  const complexTerms = /\b(comprehensive|detailed|thorough|in-depth|complete|academic|research|analyze|scholarly|expert)\b/i.test(query);
  
  // Check for query complexity metrics
  const isLengthyQuery = query.length > 80;
  const hasMultipleQuestions = query.split('?').length > 2;
  const manyWords = query.split(/\s+/).filter(Boolean).length > 12;
  
  // Check for subject matter that might benefit from deeper search
  const technicalSubject = /\b(programming|science|physics|chemistry|biology|mathematics|philosophy|history|medicine|engineering)\b/i.test(query);
  
  return complexTerms || isLengthyQuery || hasMultipleQuestions || (manyWords && technicalSubject);
}

export const searchTavily = async (
  query: string,
  opts?: TavilySearchOptions
) => {
  const apiKey = getTavilyApiKey();
  
  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }
  
  // Use provided options or determine dynamically based on query
  const dynamicResultCount = opts?.maxResults || determineResultCount(query);
  
  // Determine search depth based on query complexity if not explicitly provided
  const searchDepthToUse = opts?.searchDepth || (needsDeepSearch(query) ? "deep" : "basic");

  const tool = new TavilySearchResults({
    apiKey: apiKey,
    maxResults: dynamicResultCount,
    includeRawContent: opts?.includeRawContent || false,
    includeImages: opts?.includeImages || false,
    searchDepth: searchDepthToUse
  });

  try {
    // LangChain's TavilySearchResults tool in v0.3.36 expects a string input
    // not an object with an input property
    console.log(`Searching Tavily with query: "${query}", maxResults: ${dynamicResultCount}, searchDepth: ${searchDepthToUse}`);
    const results = await tool.invoke(query);
    
    console.log(`Tavily search returned results type: ${typeof results}`);
    
    // Parse the results - TavilySearchResults can return different formats
    let parsedResults: TavilySearchResult[];
    
    if (typeof results === 'string') {
      try {
        parsedResults = JSON.parse(results);
        console.log(`Parsed JSON results, found ${parsedResults.length} items`);
      } catch (parseError) {
        console.error('Failed to parse Tavily results as JSON:', parseError);
        console.log('Raw result string:', results);
        return { results: [], suggestions: [] };
      }
    } else if (Array.isArray(results)) {
      parsedResults = results as TavilySearchResult[];
      console.log(`Array results, found ${parsedResults.length} items`);
    } else {
      console.error('Unexpected result format from Tavily search:', results);
      return { results: [], suggestions: [] };
    }

    // Format results to match SearxNG format
    return { 
      results: parsedResults.map(result => ({
        title: result.title || 'No Title',
        url: result.url || '#',
        content: result.content || '',
        ...(result.image_url && { img_src: result.image_url }),
      })),
      suggestions: [] // Tavily doesn't provide suggestions like SearxNG
    };
  } catch (error: any) {
    console.error('Tavily search error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return { results: [], suggestions: [] };
  }
};
