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
  const [processingCount, setProcessingCount] = useState(0); // Changed to useState
  const processingImages = useRef(new Set<string>());
  const { processImage } = useImageProcessing(options, outputType, setImages, isSubscribed);

  const processNextInQueue = useCallback(() => {
    console.log(`[useImageQueue] processNextInQueue called. Queue length: ${queue.length}, Processing count: ${processingCount}`);

    if (queue.length === 0 || processingCount >= MAX_PARALLEL_PROCESSING) {
      console.log('[useImageQueue] No images in queue or max parallel processing reached. Exiting.');
      return;
    }

    setImages(prev => {
      const imagesToProcess = prev.filter(img => 
        queue.includes(img.id) && 
        !processingImages.current.has(img.id)
      ).slice(0, MAX_PARALLEL_PROCESSING - processingCount);

      console.log(`[useImageQueue] Found ${imagesToProcess.length} images to process in this batch.`);

      if (imagesToProcess.length === 0) {
        console.log('[useImageQueue] No new images to pick for processing in this iteration.');
        return prev;
      }

      imagesToProcess.forEach(image => {
        console.log(`[useImageQueue] Initiating processing for image: ${image.id}`);
        processingImages.current.add(image.id);
        setProcessingCount(prevCount => prevCount + 1); // Update state
        processImage(image).finally(() => {
          console.log(`[useImageQueue] Processing finished for image: ${image.id}`);
          processingImages.current.delete(image.id);
          setProcessingCount(prevCount => prevCount - 1); // Update state
          // Removed recursive call here; useEffect will now handle triggering next batch
        });
      });

      // Remove these from queue after initiating processing
      setQueue(current => current.filter(id => 
        !imagesToProcess.some(img => img.id === id)
      ));

      return prev;
    });
  }, [queue, processingCount, processImage, setImages, isSubscribed]); // Added processingCount to dependencies

  useEffect(() => {
    // This effect now correctly triggers processNextInQueue when queue changes
    // or when processingCount state changes (implicitly via image processing completion)
    console.log(`[useImageQueue] useEffect triggered. Current queue length: ${queue.length}, Processing count: ${processingCount}`);
    if (queue.length > 0 && processingCount < MAX_PARALLEL_PROCESSING) {
      processNextInQueue();
    }
  }, [queue, processingCount, processNextInQueue]); // processingCount is now a state variable

  const addToQueue = useCallback((imageId: string) => {
    console.log(`[useImageQueue] Adding image ${imageId} to queue.`);
    setQueue(prev => [...prev, imageId]);
  }, []);

  return { addToQueue };
}
