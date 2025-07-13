import { useCallback } from 'react';
import type { ImageFile, OutputType, CompressionOptions } from '../types';
import { decode, encode, getFileType } from '../utils/imageProcessing';
import { applyWatermark, imageDataToCanvas } from '../utils/canvas';

export function useImageProcessing(
  options: CompressionOptions,
  outputType: OutputType,
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>,
  isSubscribed: boolean
) {
  const processImageFile = useCallback(async (image: ImageFile) => {
    try {
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, status: 'processing' as const }
            : img
        )
      );

      const fileBuffer = await image.file.arrayBuffer();
      const sourceType = getFileType(image.file);
      
      if (!fileBuffer.byteLength) {
        throw new Error('Empty file');
      }

      let imageData = await decode(sourceType, fileBuffer);
      
      if (!imageData || !imageData.width || !imageData.height) {
        throw new Error('Invalid image data');
      }
      
      if (!isSubscribed) {
        const canvas = imageDataToCanvas(imageData);
        applyWatermark(canvas);
        const ctx = canvas.getContext('2d')!;
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      }

      const compressedBuffer = await encode(outputType, imageData, options);
      
      if (!compressedBuffer.byteLength) {
        throw new Error('Failed to compress image');
      }

      const blob = new Blob([compressedBuffer], { type: `image/${outputType}` });
      const preview = URL.createObjectURL(blob);

      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                status: 'complete' as const,
                preview,
                blob,
                compressedSize: compressedBuffer.byteLength,
                outputType,
              }
            : img
        )
      );
    } catch (error) {
      console.error('Error processing image:', error);
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                status: 'error' as const,
                error: error instanceof Error 
                  ? error.message 
                  : 'Failed to process image',
              }
            : img
        )
      );
    }
  }, [options, outputType, setImages, isSubscribed]);

  return { processImage: processImageFile };
}
