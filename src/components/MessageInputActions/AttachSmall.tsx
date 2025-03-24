import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import { Paperclip, File, LoaderCircle, Plus, Trash } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { File as FileType } from '../ChatWindow';

const AttachSmall = ({
  fileIds,
  setFileIds,
  files,
  setFiles,
}: {
  fileIds: string[];
  setFileIds: (fileIds: string[]) => void;
  files: FileType[];
  setFiles: (files: FileType[]) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<any>();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const data = new FormData();

    for (let i = 0; i < e.target.files!.length; i++) {
      data.append('files', e.target.files![i]);
    }

    const embeddingModelProvider = localStorage.getItem(
      'embeddingModelProvider',
    );
    const embeddingModel = localStorage.getItem('embeddingModel');

    data.append('embedding_model_provider', embeddingModelProvider!);
    data.append('embedding_model', embeddingModel!);

    const res = await fetch(`/api/uploads`, {
      method: 'POST',
      body: data,
    });

    const resData = await res.json();

    setFiles([...files, ...resData.files]);
    setFileIds([...fileIds, ...resData.files.map((file: any) => file.fileId)]);
    setLoading(false);
  };

  return loading ? (
    <div className={cn(
      "flex items-center justify-center p-2 h-9 w-9",
      "rounded-full transition-all duration-300 overflow-hidden",
      "border border-neutral-300 dark:border-white/20 border-[0.1px]",
      "bg-white dark:bg-[#313335]",
    )}>
      <LoaderCircle className="h-5 w-5 text-sky-400 animate-spin" />
    </div>
  ) : files.length > 0 ? (
    <Popover className="max-w-[15rem] md:max-w-md lg:max-w-lg">
      <PopoverButton
        type="button"
        className={cn(
          "flex items-center justify-center p-2 h-9 w-9",
          "rounded-full transition-all duration-300 overflow-hidden",
          "border border-neutral-300 dark:border-white/20 border-[0.1px]",
          "hover:shadow-md",
          "bg-gray-100 dark:bg-[#f5f5f5] text-gray-700 dark:text-[#313335]",
        )}
      >
        <File className="h-5 w-5 text-sky-400" />
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
        <PopoverPanel className="absolute z-10 w-64 md:w-[350px] bottom-14 -ml-3">
          <div className="bg-light-primary dark:bg-dark-primary border rounded-md border-light-200 dark:border-dark-200 w-full max-h-[200px] md:max-h-none overflow-y-auto flex flex-col">
            <div className="flex flex-row items-center justify-between px-3 py-2">
              <h4 className="text-black dark:text-white font-medium text-sm">
                Attached files
              </h4>
              <div className="flex flex-row items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex flex-row items-center space-x-1 text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white transition duration-200"
                >
                  <input
                    type="file"
                    onChange={handleChange}
                    ref={fileInputRef}
                    accept=".pdf,.docx,.txt"
                    multiple
                    hidden
                  />
                  <Plus size={18} />
                  <p className="text-xs">Add</p>
                </button>
                <button
                  onClick={() => {
                    setFiles([]);
                    setFileIds([]);
                  }}
                  className="flex flex-row items-center space-x-1 text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white transition duration-200"
                >
                  <Trash size={14} />
                  <p className="text-xs">Clear</p>
                </button>
              </div>
            </div>
            <div className="h-[0.5px] mx-2 bg-white/10" />
            <div className="flex flex-col items-center">
              {files.map((file, i) => (
                <div
                  key={i}
                  className="flex flex-row items-center justify-start w-full space-x-3 p-3"
                >
                  <div className="bg-dark-100 flex items-center justify-center w-10 h-10 rounded-md">
                    <File size={16} className="text-white/70" />
                  </div>
                  <p className="text-black/70 dark:text-white/70 text-sm">
                    {file.fileName.length > 25
                      ? file.fileName.replace(/\.\w+$/, '').substring(0, 25) +
                        '...' +
                        file.fileExtension
                      : file.fileName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  ) : (
    <button
      type="button"
      onClick={() => fileInputRef.current.click()}
      className={cn(
        "flex items-center justify-center p-2 h-9 w-9",
        "rounded-full transition-all duration-300 overflow-hidden",
        "border border-neutral-300 dark:border-white/20 border-[0.1px]",
        "hover:shadow-md",
        "bg-white dark:bg-[#313335] text-[#313335] dark:text-white",
      )}
    >
      <input
        type="file"
        onChange={handleChange}
        ref={fileInputRef}
        accept=".pdf,.docx,.txt"
        multiple
        hidden
      />
      <Paperclip className="h-5 w-5" />
    </button>
  );
};

export default AttachSmall;
