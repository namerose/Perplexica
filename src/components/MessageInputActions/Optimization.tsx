import { ChevronDown, Sliders, Star, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { Fragment } from 'react';

const OptimizationModes = [
  {
    key: 'speed',
    title: 'Speed',
    description: 'Prioritize speed and get the quickest possible answer.',
    icon: <Zap size={20} className="text-[#FF9800]" />,
  },
  {
    key: 'balanced',
    title: 'Balanced',
    description: 'Find the right balance between speed and accuracy',
    icon: <Sliders size={20} className="text-[#4CAF50]" />,
  },
  {
    key: 'quality',
    title: 'Quality (Soon)',
    description: 'Get the most thorough and accurate answer',
    icon: (
      <Star
        size={16}
        className="text-[#2196F3] dark:text-[#BBDEFB] fill-[#BBDEFB] dark:fill-[#2196F3]"
      />
    ),
  },
];

const Optimization = ({
  optimizationMode,
  setOptimizationMode,
}: {
  optimizationMode: string;
  setOptimizationMode: (mode: string) => void;
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
          optimizationMode !== 'balanced'
            ? "bg-gray-100 dark:bg-[#f5f5f5] text-gray-700 dark:text-[#313335]"
            : "bg-white dark:bg-[#313335] text-[#313335] dark:text-white",
        )}
      >
        {OptimizationModes.find((mode) => mode.key === optimizationMode)?.icon}
        <span className="hidden sm:block text-xs font-medium">
          {OptimizationModes.find((mode) => mode.key === optimizationMode)?.title}
        </span>
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
        <PopoverPanel className="absolute z-10 w-64 md:w-[250px] right-0">
          <div className="flex flex-col gap-2 bg-light-primary dark:bg-dark-primary border rounded-lg border-light-200 dark:border-dark-200 w-full p-4 max-h-[200px] md:max-h-none overflow-y-auto">
            {OptimizationModes.map((mode, i) => (
              <PopoverButton
                onClick={() => setOptimizationMode(mode.key)}
                key={i}
                disabled={mode.key === 'quality'}
                className={cn(
                  'p-2 rounded-lg flex flex-col items-start justify-start text-start space-y-1 duration-200 cursor-pointer transition',
                  optimizationMode === mode.key
                    ? 'bg-light-secondary dark:bg-dark-secondary'
                    : 'hover:bg-light-secondary dark:hover:bg-dark-secondary',
                  mode.key === 'quality' && 'opacity-50 cursor-not-allowed',
                )}
              >
                <div className="flex flex-row items-center space-x-1 text-black dark:text-white">
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

export default Optimization;
