/* eslint-disable @next/next/no-img-element */
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { Document } from '@langchain/core/documents';
import { File, ExternalLink, X } from 'lucide-react';
import { Fragment, useState } from 'react';

const MessageSources = ({ sources }: { sources: Document[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const closeModal = () => {
    setIsDialogOpen(false);
    document.body.classList.remove('overflow-hidden-scrollable');
  };

  const openModal = () => {
    setIsDialogOpen(true);
    document.body.classList.add('overflow-hidden-scrollable');
  };

  const getFaviconURL = (url: string): string | undefined => {
    if (url === 'File') return undefined;
    return `https://s2.googleusercontent.com/s2/favicons?domain_url=${url}&sz=64`;
  };
  
  const getHostname = (url: string) => {
    if (url === 'File') return 'Local File';
    return url.replace(/.+\/\/|www.|\..+/g, '');
  };
  
  const SourceCard = ({ source, index }: { source: Document; index: number }) => (
    <a
      className="bg-light-100 hover:bg-light-200 dark:bg-dark-100 dark:hover:bg-dark-200 transition-all duration-300 rounded-xl p-4 flex flex-col space-y-2 font-medium shadow-sm hover:shadow-md border border-transparent hover:border-light-200 dark:hover:border-dark-200 group"
      href={source.metadata.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="flex items-center justify-between">
        <p className="dark:text-white text-sm font-semibold overflow-hidden whitespace-nowrap text-ellipsis line-clamp-1 mb-1">
          {source.metadata.title}
        </p>
        <ExternalLink size={14} className="text-black/30 dark:text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-2">
          {source.metadata.url === 'File' ? (
            <div className="bg-gradient-to-br from-dark-200 to-dark-100 transition-all duration-300 flex items-center justify-center w-7 h-7 rounded-full shadow-sm">
              <File size={12} className="text-white/80" />
            </div>
          ) : (
            <div className="relative w-7 h-7 bg-light-200 dark:bg-dark-200 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={getFaviconURL(source.metadata.url)}
                width={24}
                height={24}
                alt="favicon"
                className="rounded-full h-5 w-5 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = getHostname(source.metadata.url).charAt(0).toUpperCase();
                }}
              />
            </div>
          )}
          <p className="text-xs text-black/60 dark:text-white/60 overflow-hidden whitespace-nowrap text-ellipsis font-medium">
            {getHostname(source.metadata.url)}
          </p>
        </div>
        <div className="flex items-center justify-center rounded-full bg-light-200 dark:bg-dark-200 h-5 w-5 text-black/70 dark:text-white/70 text-xs font-semibold">
          {index + 1}
        </div>
      </div>
    </a>
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
      {sources.slice(0, 3).map((source, i) => (
        <SourceCard key={i} source={source} index={i} />
      ))}
      {sources.length > 3 && (
        <button
          onClick={openModal}
          className="bg-light-100 hover:bg-light-200 dark:bg-dark-100 dark:hover:bg-dark-200 transition-all duration-300 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md border border-transparent hover:border-light-200 dark:hover:border-dark-200"
        >
          <div className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-1.5 mb-2">
              {/* Show only up to 3 source icons */}
              {sources.slice(3, 6).map((source, i) => {
                return source.metadata.url === 'File' ? (
                  <div
                    key={i}
                    className="bg-gradient-to-br from-dark-200 to-dark-100 flex items-center justify-center w-7 h-7 rounded-full shadow-sm"
                  >
                    <File size={12} className="text-white/80" />
                  </div>
                ) : (
                  <div key={i} className="relative w-7 h-7 bg-light-200 dark:bg-dark-200 rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={getFaviconURL(source.metadata.url)}
                      width={24}
                      height={24}
                      alt="favicon"
                      className="rounded-full h-5 w-5 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = getHostname(source.metadata.url).charAt(0).toUpperCase();
                      }}
                    />
                  </div>
                );
              })}
              {/* Add the +N counter directly inline with the icons */}
              {sources.length > 6 && (
                <div className="w-7 h-7 rounded-full bg-light-200 dark:bg-dark-200 flex items-center justify-center text-xs font-medium text-black/70 dark:text-white/70">
                  +{sources.length - 6}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-black/70 dark:text-white/70">
              View all {sources.length} sources
            </p>
          </div>
        </button>
      )}
      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </TransitionChild>
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-xl transform rounded-2xl bg-light-secondary dark:bg-dark-secondary border border-light-200 dark:border-dark-200 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <DialogTitle className="text-xl font-semibold leading-6 dark:text-white">
                      Sources ({sources.length})
                    </DialogTitle>
                    <button 
                      onClick={closeModal}
                      className="rounded-full p-1.5 transition-colors hover:bg-light-200 dark:hover:bg-dark-200"
                    >
                      <X size={16} className="text-black/70 dark:text-white/70" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[60vh] pr-1 scrollbar-thin scrollbar-thumb-light-200 dark:scrollbar-thumb-dark-200 scrollbar-track-transparent">
                    {sources.map((source, i) => (
                      <SourceCard key={i} source={source} index={i} />
                    ))}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default MessageSources;
