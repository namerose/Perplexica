'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import ImageGeneratorInput from '@/components/ImageGeneratorInput';
import { Disc3 } from 'lucide-react';
import { Check, ClipboardList } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: ImageResult[];
  messageId: string; // Add messageId for compatibility with Copy component
  sources?: any[]; // Add sources for compatibility with Copy component
}

interface ImageResult {
  url: string;
  width?: number;
  height?: number;
}

const ImageGenerator = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [dividerWidth, setDividerWidth] = useState(0);
  
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const messageEnd = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateDividerWidth = () => {
      if (dividerRef.current) {
        setDividerWidth(dividerRef.current.scrollWidth);
      }
    };

    updateDividerWidth();
    window.addEventListener('resize', updateDividerWidth);

    return () => {
      window.removeEventListener('resize', updateDividerWidth);
    };
  }, []);

  useEffect(() => {
    const scroll = () => {
      messageEnd.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (messages.length > 0 && messages[messages.length - 1]?.role === 'user') {
      scroll();
    }
  }, [messages]);

  const generateImage = async (prompt: string, params?: any) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      messageId: `user-${Date.now()}`
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);
    
    try {
      // Build request body with all parameters
      const requestBody = {
        prompt,
        negative_prompt: params?.negative_prompt || '',
        image_size: params?.image_size || { width: 1024, height: 1024 },
        num_inference_steps: params?.num_inference_steps || 18,
        guidance_scale: params?.guidance_scale || 5,
        num_images: params?.num_images || 1,
        enable_safety_checker: params?.enable_safety_checker !== undefined ? params.enable_safety_checker : true,
        style_name: params?.style_name || '(No style)'
      };
      
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      
      // Add assistant message with images
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `Generated image for: "${prompt}"`,
        messageId: `assistant-${Date.now()}`,
        images: data.images.map((img: any) => ({
          url: img.url,
          width: img.width,
          height: img.height
        }))
      };
      
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error generating image:', error);
      // Add error message
      const errorMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        messageId: `assistant-${Date.now()}`,
        content: `Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (message: string, params?: any) => {
    generateImage(message, params);
  };

  return (
    <div className="flex flex-col min-h-screen bg-light-primary dark:bg-dark-primary text-black dark:text-white">
      <div className="flex-1 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col space-y-6 pb-44 lg:pb-32 sm:mx-4 md:mx-8">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-lg text-center text-black/70 dark:text-white/70 max-w-md">
                  Start by typing a detailed description of the image you want to generate
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={message.id} className="w-full">
                {message.role === 'user' && (
                  <div className={cn('w-full', index === 0 ? 'pt-16' : 'pt-8', 'break-words')}>
                    <h2 className="text-black dark:text-white font-medium text-3xl lg:w-9/12">
                      {message.content}
                    </h2>
                  </div>
                )}
                
                {message.role === 'assistant' && (
                  <div className="flex flex-col space-y-4 mt-4 w-full">
                    <div className="flex flex-row items-center space-x-2 mb-2">
                      <Disc3
                        className={cn(
                          'text-black dark:text-white',
                          loading && index === messages.length - 1 ? 'animate-spin' : 'animate-none'
                        )}
                        size={20}
                      />
                      <h3 className="text-black dark:text-white font-medium text-xl">
                        Generated Image
                      </h3>
                    </div>
                    
                    {message.images && message.images.length > 0 ? (
                      <div className={cn(
                        "grid gap-4",
                        message.images.length > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
                      )}>
                        {message.images.map((image, imgIdx) => (
                          <div key={imgIdx} className="relative flex justify-center">
                            <div className="overflow-hidden rounded-lg shadow-md border border-light-200 dark:border-dark-200">
                              <img
                                src={image.url}
                                alt={`Generated image ${imgIdx + 1}`}
                                className="w-full h-auto object-contain"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-black/80 dark:text-white/80">
                        {message.content}
                      </p>
                    )}
                    
                    {!loading && (
                      <div className="flex flex-row items-center justify-end w-full text-black dark:text-white py-2">
                        <CopyButton content={message.content} />
                      </div>
                    )}
                  </div>
                )}
                
                {index < messages.length - 1 && (
                  <div className="h-px w-full bg-light-secondary dark:bg-dark-secondary mt-6" />
                )}
              </div>
            ))}
            
            {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex flex-row items-center space-x-2">
                  <Disc3 className="text-black dark:text-white animate-spin" size={20} />
                  <h3 className="text-black dark:text-white font-medium text-xl">
                    Generating...
                  </h3>
                </div>
                <p className="text-black/70 dark:text-white/70">
                  Please wait while we generate your image. This may take a few moments.
                </p>
              </div>
            )}
            
            <div ref={messageEnd} className="h-0" />
          </div>
        </div>
      </div>
      
      <div
        className="bottom-24 lg:bottom-10 fixed z-40 w-full max-w-5xl mx-auto left-0 right-0 px-4"
      >
        <div ref={dividerRef} className="w-full">
          <ImageGeneratorInput
            loading={loading}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  );
};

// Simple Copy button component
const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
      className="p-2 text-black/70 dark:text-white/70 rounded-xl hover:bg-light-secondary dark:hover:bg-dark-secondary transition duration-200 hover:text-black dark:hover:text-white"
    >
      {copied ? <Check size={18} /> : <ClipboardList size={18} />}
    </button>
  );
};

export default ImageGenerator;
