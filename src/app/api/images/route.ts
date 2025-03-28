import handleImageSearch from '@/lib/chains/imageSearchAgent';
import {
  getCustomOpenaiApiKey,
  getCustomOpenaiApiUrl,
  getCustomOpenaiModelName,
} from '@/lib/config';
import { getAvailableChatModelProviders } from '@/lib/providers';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';

interface ChatModel {
  provider: string;
  model: string;
}

interface ImageSearchBody {
  query: string;
  chatHistory: any[];
  chatModel?: ChatModel;
  focusMode?: string;
}

export const POST = async (req: Request) => {
  try {
    const body: ImageSearchBody = await req.json();

    const chatHistory = body.chatHistory
      .map((msg: any) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        } else if (msg.role === 'assistant') {
          return new AIMessage(msg.content);
        }
      })
      .filter((msg) => msg !== undefined) as BaseMessage[];

    const chatModelProviders = await getAvailableChatModelProviders();

    const chatModelProvider =
      chatModelProviders[
        body.chatModel?.provider || Object.keys(chatModelProviders)[0]
      ];
    const chatModel =
      chatModelProvider[
        body.chatModel?.model || Object.keys(chatModelProvider)[0]
      ];

    let llm: BaseChatModel | undefined;

    if (body.chatModel?.provider === 'custom_openai') {
      llm = new ChatOpenAI({
        openAIApiKey: getCustomOpenaiApiKey(),
        modelName: getCustomOpenaiModelName(),
        temperature: 0.7,
        configuration: {
          baseURL: getCustomOpenaiApiUrl(),
        },
      }) as unknown as BaseChatModel;
    } else if (chatModelProvider && chatModel) {
      llm = chatModel.model;
    }

    if (!llm) {
      return Response.json({ error: 'Invalid chat model' }, { status: 400 });
    }

    // Determine search engine based on focus mode
    let searchEngine: 'searxng' | 'tavily' | 'both' = 'searxng';
    
    if (body.focusMode === 'webSearchTavily') {
      searchEngine = 'tavily';
    } else if (body.focusMode === 'webSearchBoth') {
      searchEngine = 'both';
    }
    
    console.log(`Image search using engine: ${searchEngine} for query: "${body.query}"`);
    
    const images = await handleImageSearch(
      {
        chat_history: chatHistory,
        query: body.query,
      },
      llm,
      searchEngine
    );

    return Response.json({ images }, { status: 200 });
  } catch (err) {
    console.error(`An error ocurred while searching images: ${err}`);
    return Response.json(
      { message: 'An error ocurred while searching images' },
      { status: 500 },
    );
  }
};
