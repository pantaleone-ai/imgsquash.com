import React, { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { CompressionOptions } from './components/CompressionOptions';
import { DropZone } from './components/DropZone';
import { ImageList } from './components/ImageList';
import { DownloadAll } from './components/DownloadAll';
import { useImageQueue } from './hooks/useImageQueue';
import { DEFAULT_QUALITY_SETTINGS } from './utils/formatDefaults';
import type { ImageFile, OutputType, CompressionOptions as CompressionOptionsType } from './types';
// import { Logo } from './components/Logo';


export function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [outputType, setOutputType] = useState<OutputType>('webp');
  const [options, setOptions] = useState<CompressionOptionsType>({
    quality: DEFAULT_QUALITY_SETTINGS.webp,
  });

  const { addToQueue } = useImageQueue(options, outputType, setImages);

  const handleOutputTypeChange = useCallback((type: OutputType) => {
    setOutputType(type);
    if (type !== 'png') {
      setOptions({ quality: DEFAULT_QUALITY_SETTINGS[type] });
    }
  }, []);

  const handleFilesDrop = useCallback((newImages: ImageFile[]) => {
    // First add all images to state
    setImages((prev) => [...prev, ...newImages]);
    
    // Use requestAnimationFrame to wait for render to complete
    requestAnimationFrame(() => {
      // Then add to queue after UI has updated
      newImages.forEach(image => addToQueue(image.id));
    });
  }, [addToQueue]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find(img => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    images.forEach(image => {
      if (image.preview) {
        URL.revokeObjectURL(image.preview);
      }
    });
    setImages([]);
  }, [images]);

  const handleDownloadAll = useCallback(async () => {
    const completedImages = images.filter((img) => img.status === "complete");

    for (const image of completedImages) {
      if (image.blob && image.outputType) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(image.blob);
        link.download = `${image.file.name.split(".")[0]}.${image.outputType}`;
        link.click();
        URL.revokeObjectURL(link.href);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }, [images]);

  const completedImages = images.filter(img => img.status === 'complete').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {/* <img className="w-10 h-10" src='/img-sq-icon.png'></img> */}


            <img className="rounded-lg drop-shadow-lg shadow-blue-gray-900/50 h-20" src='/img-squash-logo-full.png' alt='Imgsquash.com-logo - Free Online Image Compressor'></img>
       

          </div>
          <h1 className="text-gray-800 text-2xl">
          Free Online Image Compressor
          </h1>
          <h2 className="text-gray-600 text-lg">Convert and optimize slow loading images to AVIF, JPEG, JPEG XL, PNG, or WebP from your browser!</h2>
        </div>

        <div className="space-y-6">
          <CompressionOptions
            options={options}
            outputType={outputType}
            onOptionsChange={setOptions}
            onOutputTypeChange={handleOutputTypeChange}
          />

          <DropZone onFilesDrop={handleFilesDrop} />

          {completedImages > 0 && (
            <DownloadAll onDownloadAll={handleDownloadAll} count={completedImages} />
          )}

          <ImageList 
            images={images} 
            onRemove={handleRemoveImage} 
          />

          {images.length > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          )}
                  <div className="text-center m-8">
                  <div className="flex items-center justify-center gap-2 mt-10 pt-20">
                    

    <section className="w-full">
      <div className="w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">AVIF Image Format</h2>
        <p className="text-gray-600 mb-4">AVIF (AV1 Image File Format) is a next-generation format offering superior compression for web images.</p>
        <h3 className="text-lg font-medium text-gray-700 text-left">Positives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Excellent compression: Smaller file sizes than JPEG and WebP.</li>
          <li>High quality: Supports lossless and lossy compression.</li>
          <li>Modern features: Transparency and wide color gamut.</li>
        </ul>
        <h3 className="text-lg font-medium text-gray-700 text-left">Negatives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Limited browser support: Not fully compatible with older browsers.</li>
          <li>Slower encoding: Requires more processing power.</li>
        </ul>
        <p className="text-gray-600">Use AVIF for modern websites needing high-quality images with minimal file sizes. Compress AVIF files with Imgsquash.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">JPEG Image Format</h2>
        <p className="text-gray-600 mb-4">JPEG (Joint Photographic Experts Group) is a widely used format for photos and web graphics.</p>
        <h3 className="text-lg font-medium text-gray-700 text-left">Positives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Universal support: Compatible with all browsers and devices.</li>
          <li>Good compression: Reduces file sizes for fast loading.</li>
          <li>Versatile: Ideal for photographs and complex images.</li>
        </ul>
        <h3 className="text-lg font-medium text-gray-700 text-left">Negatives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Lossy compression: Quality degrades with heavy compression.</li>
          <li>No transparency: Not suitable for logos or overlays.</li>
        </ul>
        <p className="text-gray-600">Use JPEG for photos on websites or social media. Optimize JPEGs with Imgsquash’s free JPEG compressor.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">JPEG XL Image Format</h2>
        <p className="text-gray-600 mb-4">JPEG XL is an advanced format designed to replace JPEG with better compression and features.</p>
        <h3 className="text-lg font-medium text-gray-700 text-left">Positives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Superior compression: Smaller files than JPEG with better quality.</li>
          <li>Lossless and lossy: Flexible for various use cases.</li>
          <li>Backward compatibility: Supports legacy JPEG decoding.</li>
        </ul>
        <h3 className="text-lg font-medium text-gray-700 text-left">Negatives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Emerging format: Limited browser support in 2025.</li>
          <li>Complex adoption: Requires updated software.</li>
        </ul>
        <p className="text-gray-600">Use JPEG XL for future-proof web projects. Try compressing JPEG XL files with Imgsquash.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">PNG Image Format</h2>
        <p className="text-gray-600 mb-4">PNG (Portable Network Graphics) is popular for web graphics requiring transparency.</p>
        <h3 className="text-lg font-medium text-gray-700 text-left">Positives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Transparency support: Perfect for logos and overlays.</li>
          <li>Lossless compression: Maintains quality without degradation.</li>
          <li>Wide compatibility: Supported by all browsers.</li>
        </ul>
        <h3 className="text-lg font-medium text-gray-700 text-left">Negatives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Larger file sizes: Less efficient than AVIF or WebP.</li>
          <li>Not ideal for photos: Better for graphics than complex images.</li>
        </ul>
        <p className="text-gray-600">Use PNG for logos or images needing transparency. Optimize PNGs with Imgsquash’s PNG compressor.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">WebP Image Format</h2>
        <p className="text-gray-600 mb-4">WebP is a modern format developed by Google for efficient web images.</p>
        <h3 className="text-lg font-medium text-gray-700 text-left">Positives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Efficient compression: Smaller files than JPEG and PNG.</li>
          <li>Transparency support: Similar to PNG but with smaller sizes.</li>
          <li>Lossy and lossless: Versatile for various needs.</li>
        </ul>
        <h3 className="text-lg font-medium text-gray-700 text-left">Negatives</h3>
        <ul className="list-disc pl-5 text-gray-600 mb-4 text-left">
          <li>Browser compatibility: Not supported by some older browsers.</li>
          <li>Conversion required: May need tools to convert from other formats.</li>
        </ul>
        <p className="text-gray-600">Use WebP for fast-loading web images. Convert and compress WebP files with Imgsquash’s WebP converter.</p>
      </div>
    </section>
    </div>
                    
                    
                    <h1 className="text-gray-500 text-xs pt-10">
                      &copy; copyright imgsquash.com all rights reserved
                   </h1>
                 


          
          <p className="text-gray-400 text-xs pt-2">
          <a href='/privacy.html' target='_blank' >Privacy policy </a>
          |  
          <a href='/terms.html' target='_blank' > Terms of use </a>
          </p>
          </div>
          </div>
        </div>
        
      </div>
  
  );
}
