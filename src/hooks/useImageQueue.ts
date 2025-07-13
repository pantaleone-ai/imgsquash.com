import { useState, useCallback, useEffect, useRef } from 'react';
import type { ImageFile, OutputType, CompressionOptions } from '../types';
import { useImageProcessing } from './useImageProcessing';

export function useImageQueue(
  options: CompressionOptions,
  outputType: OutputType,
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>,
  isSubscribed: boolean
) {
  const MAX_PARALLEL_PROCESSING = 3;
  const [queue, setQueue] = useState<string[]>([]);
  const processingCount = useRef(0);
  const processingImages = useRef(new Set<string>());
  const { processImage } = useImageProcessing(options, outputType, setImages, isSubscribed);

  const processNextInQueue = useCallback(() => {
    if (queue.length === 0 || processingCount.current >= MAX_PARALLEL_PROCESSING) {
      return;
    }

    setImages(prev => {
      const imagesToProcess = prev.filter(img => 
        queue.includes(img.id) && 
        !processingImages.current.has(img.id)
      ).slice(0, MAX_PARALLEL_PROCESSING - processingCount.current);

      if (imagesToProcess.length === 0) {
        return prev;
      }

      imagesToProcess.forEach(image => {
        processingImages.current.add(image.id);
        processingCount.current++;
        processImage(image).finally(() => {
          processingImages.current.delete(image.id);
          processingCount.current--;
          processNextInQueue();
        });
      });

      setQueue(current => current.filter(id => 
        !imagesToProcess.some(img => img.id === id)
      ));

      return prev.map(img => 
        imagesToProcess.some(processImg => processImg.id === img.id)
          ? { ...img, status: 'queued' as const }
          : img
      );
    });
  }, [queue, processImage, setImages, isSubscribed]);

  useEffect(() => {
    processNextInQueue();
  }, [queue, processNextInQueue]);

  const addToQueue = useCallback((imageId: string) => {
    setQueue(prev => [...prev, imageId]);
  }, []);

  return { addToQueue };
}
