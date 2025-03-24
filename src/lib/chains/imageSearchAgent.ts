import {
  RunnableSequence,
  RunnableMap,
  RunnableLambda,
} from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import formatChatHistoryAsString from '../utils/formatHistory';
import { BaseMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { searchSearxng } from '../searxng';
import { searchTavily } from '../tavily';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

const imageSearchChainPrompt = `
You will be given a conversation below and a follow up question. You need to rephrase the follow-up question so it is a standalone question that can be used by the LLM to search the web for images.
You need to make sure the rephrased question agrees with the conversation and is relevant to the conversation.

Example:
1. Follow up question: What is a cat?
Rephrased: A cat

2. Follow up question: What is a car? How does it works?
Rephrased: Car working

3. Follow up question: How does an AC work?
Rephrased: AC working

Conversation:
{chat_history}

Follow up question: {query}
Rephrased question:
`;

type ImageSearchChainInput = {
  chat_history: BaseMessage[];
  query: string;
};

interface ImageSearchResult {
  img_src: string;
  url: string;
  title: string;
}

const strParser = new StringOutputParser();

const createImageSearchChain = (llm: BaseChatModel) => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: ImageSearchChainInput) => {
        return formatChatHistoryAsString(input.chat_history);
      },
      query: (input: ImageSearchChainInput) => {
        return input.query;
      },
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input: string) => {
      input = input.replace(/<think>.*?<\/think>/g, '');

      const res = await searchSearxng(input, {
        engines: ['bing images', 'google images'],
      });

      const images: ImageSearchResult[] = [];

      res.results.forEach((result) => {
        if (result.img_src && result.url && result.title) {
          images.push({
            img_src: result.img_src,
            url: result.url,
            title: result.title,
          });
        }
      });

      return images.slice(0, 10);
    }),
  ]);
};

// Function to search images using Tavily
const searchImagesWithTavily = async (query: string): Promise<ImageSearchResult[]> => {
  try {
    const tavilyResults = await searchTavily(query, {
      includeImages: true,
      maxResults: 15  // Request more results to ensure we get enough images
    });
    
    const images: ImageSearchResult[] = [];
    
    tavilyResults.results.forEach((result) => {
      if (result.img_src && result.url && result.title) {
        images.push({
          img_src: result.img_src,
          url: result.url,
          title: result.title,
        });
      }
    });
    
    return images.slice(0, 10);
  } catch (error) {
    console.error('Error searching images with Tavily:', error);
    return [];
  }
};

// Create a chain that uses either SearxNG or Tavily based on the searchEngine parameter
const createImageSearchChainWithEngine = (llm: BaseChatModel, searchEngine: 'searxng' | 'tavily' | 'both' = 'searxng') => {
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: ImageSearchChainInput) => {
        return formatChatHistoryAsString(input.chat_history);
      },
      query: (input: ImageSearchChainInput) => {
        return input.query;
      },
    }),
    PromptTemplate.fromTemplate(imageSearchChainPrompt),
    llm,
    strParser,
    RunnableLambda.from(async (input: string) => {
      input = input.replace(/<think>.*?<\/think>/g, '');
      
      let images: ImageSearchResult[] = [];
      
      if (searchEngine === 'searxng' || searchEngine === 'both') {
        const searxResults = await searchSearxng(input, {
          engines: ['bing images', 'google images'],
        });
        
        searxResults.results.forEach((result) => {
          if (result.img_src && result.url && result.title) {
            images.push({
              img_src: result.img_src,
              url: result.url,
              title: result.title,
            });
          }
        });
      }
      
      if (searchEngine === 'tavily' || searchEngine === 'both') {
        const tavilyImages = await searchImagesWithTavily(input);
        
        // Merge unique images (avoid duplicates by URL)
        const existingUrls = new Set(images.map(img => img.url));
        tavilyImages.forEach(img => {
          if (!existingUrls.has(img.url)) {
            images.push(img);
            existingUrls.add(img.url);
          }
        });
      }
      
      return images.slice(0, 10);
    }),
  ]);
};

const handleImageSearch = (
  input: ImageSearchChainInput,
  llm: BaseChatModel,
  searchEngine?: 'searxng' | 'tavily' | 'both'
) => {
  // Default to searxng if not specified
  const engine = searchEngine || 'searxng';
  
  // Get the active search engine from localStorage if in browser environment
  let activeEngine = engine;
  if (typeof window !== 'undefined') {
    const focusMode = localStorage.getItem('focusMode');
    if (focusMode === 'webSearchTavily') {
      activeEngine = 'tavily';
    } else if (focusMode === 'webSearchBoth') {
      activeEngine = 'both';
    }
  }
  
  const imageSearchChain = createImageSearchChainWithEngine(llm, activeEngine);
  return imageSearchChain.invoke(input);
};

export default handleImageSearch;
