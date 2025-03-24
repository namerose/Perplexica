import {
  BadgePercent,
  ChevronDown,
  Code,
  Globe,
  Pencil,
  ScanEye,
  SwatchBook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { SiReddit, SiYoutube } from '@icons-pack/react-simple-icons';
import { Fragment } from 'react';

const focusModes = [
  {
    key: 'webSearch',
    title: 'SearxNG',
    description: 'Search the internet using SearxNG',
    icon: <Globe size={20} />,
  },
  {
    key: 'webSearchTavily',
    title: 'Tavily',
    description: 'Search the internet using Tavily API',
    icon: <Globe size={20} className="text-blue-500" />,
  },
  {
    key: 'webSearchBoth',
    title: 'Combined',
    description: 'Search using both SearxNG and Tavily',
    icon: <Globe size={20} className="text-purple-500" />,
  },
  {
    key: 'academicSearch',
    title: 'Academic',
    description: 'Search in published academic papers',
    icon: <SwatchBook size={20} />,
  },
  {
    key: 'writingAssistant',
    title: 'Writing',
    description: 'Chat without searching the web',
    icon: <Pencil size={16} />,
  },
  {
    key: 'codeAssistant',
    title: 'Code',
    description: 'Help with coding and development tasks',
    icon: <Code size={20} />,
  },
  {
    key: 'wolframAlphaSearch',
    title: 'Wolfram Alpha',
    description: 'Computational knowledge engine',
    icon: <BadgePercent size={20} />,
  },
  {
    key: 'youtubeSearch',
    title: 'Youtube',
    description: 'Search and watch videos',
    icon: <SiYoutube className="h-5 w-auto mr-0.5" />,
  },
  {
    key: 'redditSearch',
    title: 'Reddit',
    description: 'Search for discussions and opinions',
    icon: <SiReddit className="h-5 w-auto mr-0.5" />,
  },
];

const Focus = ({
  focusMode,
  setFocusMode,
}: {
  focusMode: string;
  setFocusMode: (mode: string) => void;
}) => {
  return (
    <Popover className="relative w-full max-w-[15rem] md:max-w-md lg:max-w-lg">
      <PopoverButton
        type="button"
        className={cn(
          "flex items-center justify-center gap-2 p-2 h-9 w-9 sm:w-auto sm:px-4",
          "rounded-full transition-all duration-300 overflow-hidden",
          "border border-neutral-300 dark:border-white/20 border-[0.1px]",
          "hover:shadow-md text-sm",
          focusMode !== 'webSearch'
            ? "bg-gray-100 dark:bg-[#f5f5f5] text-gray-700 dark:text-[#313335]"
            : "bg-white dark:bg-[#313335] text-[#313335] dark:text-white",
        )}
      >
        {focusMode !== 'webSearch' ? (
          <>
            {focusModes.find((mode) => mode.key === focusMode)?.icon}
            <span className="hidden sm:block text-xs font-medium">
              {focusModes.find((mode) => mode.key === focusMode)?.title}
            </span>
          </>
        ) : (
          <>
            <ScanEye className="h-3.5 w-3.5" />
            <span className="hidden sm:block text-xs font-medium">Focus</span>
          </>
        )}
      </PopoverButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute z-10 w-64 md:w-[500px] left-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-light-primary dark:bg-dark-primary border rounded-lg border-light-200 dark:border-dark-200 w-full p-4 max-h-[200px] md:max-h-none overflow-y-auto">
            {focusModes.map((mode, i) => (
              <PopoverButton
                onClick={() => setFocusMode(mode.key)}
                key={i}
                className={cn(
                  'p-2 rounded-lg flex flex-col items-start justify-start text-start space-y-2 duration-200 cursor-pointer transition',
                  focusMode === mode.key
                    ? 'bg-light-secondary dark:bg-dark-secondary'
                    : 'hover:bg-light-secondary dark:hover:bg-dark-secondary',
                )}
              >
                <div
                  className={cn(
                    'flex flex-row items-center space-x-1',
                    focusMode === mode.key
                      ? 'text-[#24A0ED]'
                      : 'text-black dark:text-white',
                  )}
                >
                  {mode.icon}
                  <p className="text-sm font-medium">{mode.title}</p>
                </div>
                <p className="text-black/70 dark:text-white/70 text-xs">
                  {mode.description}
                </p>
              </PopoverButton>
            ))}
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default Focus;
