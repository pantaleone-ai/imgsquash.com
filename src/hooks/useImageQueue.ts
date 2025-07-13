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
    console.log(`[useImageQueue] processNextInQueue called. Queue length: ${queue.length}, Processing count: ${processingCount.current}`);

    if (queue.length === 0 || processingCount.current >= MAX_PARALLEL_PROCESSING) {
      console.log('[useImageQueue] No images in queue or max parallel processing reached. Exiting.');
      return;
    }

    setImages(prev => {
      const imagesToProcess = prev.filter(img => 
        queue.includes(img.id) && 
        !processingImages.current.has(img.id)
      ).slice(0, MAX_PARALLEL_PROCESSING - processingCount.current);

      console.log(`[useImageQueue] Found ${imagesToProcess.length} images to process in this batch.`);

      if (imagesToProcess.length === 0) {
        console.log('[useImageQueue] No new images to pick for processing in this iteration.');
        return prev;
      }

      imagesToProcess.forEach(image => {
        console.log(`[useImageQueue] Initiating processing for image: ${image.id}`);
        processingImages.current.add(image.id);
        processingCount.current++;
        processImage(image).finally(() => {
          console.log(`[useImageQueue] Processing finished for image: ${image.id}`);
          processingImages.current.delete(image.id);
          processingCount.current--;
          // Recursively call to process next image if capacity available
          processNextInQueue();
        });
      });

      // Remove these from queue after initiating processing
      setQueue(current => current.filter(id => 
        !imagesToProcess.some(img => img.id === id)
      ));

      // Return the previous state without modifying status here
      // Image status updates are handled by useImageProcessing directly
      return prev;
    });
  }, [queue, processImage, setImages, isSubscribed]);

  useEffect(() => {
    console.log(`[useImageQueue] Queue or processNextInQueue dependency changed. Current queue length: ${queue.length}`);
    if (queue.length > 0) {
      processNextInQueue();
    }
  }, [queue, processNextInQueue]);

  const addToQueue = useCallback((imageId: string) => {
    console.log(`[useImageQueue] Adding image ${imageId} to queue.`);
    setQueue(prev => [...prev, imageId]);
  }, []);

  return { addToQueue };
}
