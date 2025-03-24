import { cn } from '@/lib/utils';
import { ArrowUp, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

// Image generation parameter types
type ImageSize = {
  width: number;
  height: number;
};

// Predefined image sizes
const IMAGE_SIZES = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 768, height: 1024 },
  landscape: { width: 1024, height: 768 },
  wide: { width: 1280, height: 720 }
};

// Style options
const STYLE_OPTIONS = [
  '(No style)',
  'Cinematic',
  'Photographic',
  'Anime',
  'Manga',
  'Digital Art',
  'Pixel art',
  'Fantasy art',
  'Neonpunk',
  '3D Model'
];

// Interface for image generation parameters
interface ImageGenerationParams {
  prompt: string;
  negative_prompt?: string;
  image_size: ImageSize;
  num_inference_steps: number;
  guidance_scale: number;
  num_images: number;
  enable_safety_checker: boolean;
  style_name: string;
}

const ImageGeneratorInput = ({
  sendMessage,
  loading,
}: {
  sendMessage: (message: string, params?: Omit<ImageGenerationParams, 'prompt'>) => void;
  loading: boolean;
}) => {
  // Basic input state
  const [message, setMessage] = useState('');
  const [textareaRows, setTextareaRows] = useState(1);
  const [mode, setMode] = useState<'multi' | 'single'>('single');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  
  // Advanced parameters state
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>(IMAGE_SIZES.square);
  const [numInferenceSteps, setNumInferenceSteps] = useState(18);
  const [guidanceScale, setGuidanceScale] = useState(5);
  const [numImages, setNumImages] = useState(1);
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [styleName, setStyleName] = useState<string>('(No style)');
  
  // Function to handle form submission with all parameters
  const handleSubmit = () => {
    if (!message.trim() || loading) return;
    
    const params: Omit<ImageGenerationParams, 'prompt'> = {
      negative_prompt: negativePrompt,
      image_size: imageSize,
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
      num_images: numImages,
      enable_safety_checker: enableSafetyChecker,
      style_name: styleName
    };
    
    sendMessage(message, params);
    setMessage('');
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          if (loading) return;
          e.preventDefault();
          handleSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !loading && !showAdvancedOptions) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        className={cn(
          'bg-light-secondary dark:bg-dark-secondary p-4 flex items-center overflow-hidden border border-light-200 dark:border-dark-200',
          mode === 'multi' ? 'flex-col rounded-lg' : 'flex-row rounded-full',
        )}
      >
        <TextareaAutosize
          ref={inputRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (e.target.value && textareaRows >= 2 && mode === 'single') {
              setMode('multi');
            } else if (!e.target.value && mode === 'multi') {
              setMode('single');
            }
          }}
          onHeightChange={(height, props) => {
            const rows = Math.ceil(height / props.rowHeight);
            setTextareaRows(rows);
            if (rows >= 2 && message && mode === 'single') {
              setMode('multi');
            }
          }}
          className="transition bg-transparent dark:placeholder:text-white/50 placeholder:text-sm text-sm dark:text-white resize-none focus:outline-none w-full px-2 max-h-24 lg:max-h-36 xl:max-h-48 flex-grow flex-shrink"
          placeholder="Describe the image you want to generate..."
        />
        <div className="flex flex-row items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition duration-200"
            title="Advanced Options"
          >
            <Settings size={20} />
          </button>
          <button
            type="submit"
            disabled={message.trim().length === 0 || loading}
            className="bg-[#24A0ED] text-white disabled:text-black/50 dark:disabled:text-white/50 hover:bg-opacity-85 transition duration-100 disabled:bg-[#e0e0dc79] dark:disabled:bg-[#ececec21] rounded-full p-2"
          >
            <ArrowUp className="bg-background" size={17} />
          </button>
        </div>
      </form>
      
      {showAdvancedOptions && (
        <div className="mt-3 rounded-lg bg-light-secondary dark:bg-dark-secondary p-4 border border-light-200 dark:border-dark-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Generation Settings</h3>
            <button
              onClick={() => setShowAdvancedOptions(false)}
              className="text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            >
              {showAdvancedOptions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Negative Prompt */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-1">Negative Prompt</label>
              <TextareaAutosize
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Specify what you don't want in the image..."
                className="w-full p-2 rounded-md bg-light-primary dark:bg-dark-primary text-sm resize-none border border-light-200 dark:border-dark-200 focus:outline-none focus:ring-1 focus:ring-[#24A0ED]"
                minRows={2}
                maxRows={4}
              />
            </div>
            
            {/* Image Size */}
            <div>
              <label className="block text-sm font-medium mb-1">Image Size</label>
              <select
                value={`${imageSize.width}x${imageSize.height}`}
                onChange={(e) => {
                  const [width, height] = e.target.value.split('x').map(dim => parseInt(dim));
                  setImageSize({ width, height });
                }}
                className="w-full p-2 rounded-md bg-light-primary dark:bg-dark-primary text-sm border border-light-200 dark:border-dark-200 focus:outline-none focus:ring-1 focus:ring-[#24A0ED]"
              >
                <option value="1024x1024">Square (1024×1024)</option>
                <option value="768x1024">Portrait (768×1024)</option>
                <option value="1024x768">Landscape (1024×768)</option>
                <option value="1280x720">Wide (1280×720)</option>
              </select>
            </div>
            
            {/* Style */}
            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <select
                value={styleName}
                onChange={(e) => setStyleName(e.target.value)}
                className="w-full p-2 rounded-md bg-light-primary dark:bg-dark-primary text-sm border border-light-200 dark:border-dark-200 focus:outline-none focus:ring-1 focus:ring-[#24A0ED]"
              >
                {STYLE_OPTIONS.map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
            
            {/* Steps */}
            <div>
              <label className="block text-sm font-medium mb-1">Steps: {numInferenceSteps}</label>
              <input
                type="range"
                min="10"
                max="50"
                value={numInferenceSteps}
                onChange={(e) => setNumInferenceSteps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Guidance Scale */}
            <div>
              <label className="block text-sm font-medium mb-1">Guidance Scale: {guidanceScale}</label>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={guidanceScale}
                onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Number of Images */}
            <div>
              <label className="block text-sm font-medium mb-1">Number of Images</label>
              <select
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value))}
                className="w-full p-2 rounded-md bg-light-primary dark:bg-dark-primary text-sm border border-light-200 dark:border-dark-200 focus:outline-none focus:ring-1 focus:ring-[#24A0ED]"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            {/* Safety Filter */}
            <div>
              <label className="flex items-center text-sm space-x-2">
                <input
                  type="checkbox"
                  checked={enableSafetyChecker}
                  onChange={(e) => setEnableSafetyChecker(e.target.checked)}
                  className="rounded"
                />
                <span>Enable Safety Filter</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGeneratorInput;
