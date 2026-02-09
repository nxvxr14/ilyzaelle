import { useRef, useCallback, useState } from 'react';

export const useCamera = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const openCamera = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  }, []);

  const reset = useCallback(() => {
    setPreview(null);
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, []);

  return {
    inputRef,
    preview,
    file,
    openCamera,
    handleFileChange,
    reset,
  };
};
