import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { CompressionOptions } from './components/CompressionOptions';
import { DropZone } from './components/DropZone';
import { ImageList } from './components/ImageList';
import { DownloadAll } from './components/DownloadAll';
import { useImageQueue } from './hooks/useImageQueue';
import { DEFAULT_QUALITY_SETTINGS } from './utils/formatDefaults';
import type { ImageFile, OutputType, CompressionOptions as CompressionOptionsType } from './types';
import { supabase } from './utils/supabase';
import { StripeProvider } from './components/StripeProvider';
import Navbar from './components/Navbar';
import { useSubscription } from './hooks/useSubscription';

export function App() {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('item-0');
  const [images, setImages] = useState<ImageFile[]>([]);
  const [outputType, setOutputType] = useState<OutputType>('webp');
  const [options, setOptions] = useState<CompressionOptionsType>({
    quality: DEFAULT_QUALITY_SETTINGS.webp,
  });
  const { isSubscribed, session } = useSubscription();

  const { addToQueue } = useImageQueue(options, outputType, setImages, isSubscribed);

  const handleOutputTypeChange = useCallback((type: OutputType) => {
    setOutputType(type);
    if (type !== 'png') {
      setOptions({ quality: DEFAULT_QUALITY_SETTINGS[type] });
    }
  }, []);

  const handleFilesDrop = useCallback((newImages: ImageFile[]) => {
    setImages((prev) => [...prev, ...newImages]);
    requestAnimationFrame(() => {
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
    <div className="min-h-screen bg-gray-100">
      <Navbar session={session} onLogin={() => {}} onLogout={() => supabase.auth.signOut()} />
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl leading-none font-extrabold text-gray-900 sm:text-5xl">
            Create Faster Loading Images
          </h1>
          <h2 className="mt-4 text-xl text-gray-700 font-semibold">
            Convert & Compress to AVIF, WebP, PNG, & JPEGXL
          </h2>
          <p className="leading-6 mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Boost speed, SEO and user experience by instantly shrinking image file sizes without reducing quality!
          </p>
        </header>

        {session && !isSubscribed && (
          <StripeProvider />
        )}

        <section className="space-y-8">
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
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Clear All
            </button>
          )}
        </section>
        <section id="subscribe-section" className="mt-10">
          <hr className="border-t-1 border-gray-200" />
        </section>

        <section className="mt-10 grid gap-12">
          <article className="p-6 bg-white rounded-2xl shadow-lg">
            <h2 className="leading-none text-3xl text-center font-bold text-gray-900 mb-6">Remove the Watermark Forever!</h2>
            <p className="text-md text-gray-600 mb-4">
            imgSquash is growing fast and our resources are too! Get unlimited, lifetime access with a small one-time fee or subscription.           
            </p>
            <p className="leading-6 text-lg font-medium text-gray-800 text-center">
            Get unlimited, lifetime access with a small one-time fee or subscription!            
            </p>
            <section className="flex items-center justify-center mt-6 pb-10">
        
    <div className="p-4 sm:px-10 flex flex-col justify-center items-center text-base h-100vh mx-auto" id="pricing">
       
       
       
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">

        <div className="ring-2 ring-blue-600 rounded-3xl p-8 xl:p-10 shadow-lg">
                <div className="flex items-center justify-between gap-x-4">
                    <h3 id="tier-extended" className="text-blue-600 text-3xl font-bold leading-8">LIFETIME</h3>
                    <p className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-blue-600">
                        Most popular</p>
                </div>
                <p className="mt-4 text-base leading-6 text-gray-600">Unlimited use for life</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="line-through text-2xl font-sans text-gray-500/70">$99</span><span
                        className="text-5xl font-bold tracking-tight text-gray-900">$49</span>
                </p>
                <a href="" 
                    aria-describedby="tier-extended"
                    className="bg-blue-600 text-white shadow-md hover:bg-blue-500 mt-6 block rounded-md py-2 px-3 text-center text-base font-medium leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    target="_blank">Buy Now & Save</a>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Unlimited access for life
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Access all future features
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            strokeWidth="1.5" stroke="currentColor" aria-hidden="true"
                            className="h-6 w-5 flex-none text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Priority support
                    </li>
                </ul>
            </div>



            <div className="ring-1 ring-gray-200 rounded-3xl p-8 xl:p-10">
                <div className="flex items-center justify-between gap-x-4">
                    <h3 id="tier-standard" className="text-gray-900 text-2xl font-medium leading-8">Monthly Unlimited</h3>
                </div>
                <p className="mt-4 text-base leading-6 text-gray-600">Unlimited use for a small monthly fee</p>
                <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="line-through text-2xl font-sans text-gray-500/70">$19</span><span
                        className="text-5xl font-bold tracking-tight text-gray-900">$9</span>
                </p>
                <a href=""
                    aria-describedby="tier-standard"
                    className="text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 mt-6 block rounded-md py-2 px-3 text-center text-base font-medium leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    target="_blank">Buy now</a>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600 xl:mt-10">
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Unlimited access
                    </li>
                    <li className="flex gap-x-3 text-base">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                            stroke="currentColor" aria-hidden="true" className="h-6 w-5 flex-none text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>Self serve support
                    </li>
                </ul>
            </div>

        </div>
    </div>
</section>
          </article>
          </section>



        <section className="mt-16 grid gap-12">
          <article className="p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">Boost Website Speed with Our Free Online Image Compressor</h2>
            <p className="text-lg text-gray-600 mb-6">
              Make your website blazing fast and improve your search engine ranking with Imgsquash, your free online image optimization tool. Our powerful image converter and compressor allows you to effortlessly convert and shrink your images right in your browser, supporting all the essential formats: AVIF, JPEG, PNG, WebP, and JPEG XL.
            </p>
            <h3 className="leading-none text-2xl font-semibold text-gray-800 mb-4">Why is Image Optimization Needed?</h3>
            <p className="text-lg text-gray-600 mb-6">
              Large, unoptimized images can significantly slow down your website, leading to frustrated visitors and lower search engine rankings. Google and other search engines prioritize fast-loading websites, making image optimization a vital part of your SEO strategy. By reducing image file sizes without sacrificing quality, you can dramatically improve your site's performance and provide a better user experience.
            </p>
            <h3 className="leading-none text-2xl font-semibold text-gray-800 mb-4">imgSquash.com: Your Local Image Optimization Tool</h3>
            <ul className="list-disc pl-6 text-lg text-gray-600 space-y-4">
              <li>
                <strong>Support for Next-Gen Formats:</strong> Easily convert your images to modern, highly efficient formats like AVIF and WebP, known for their superior compression and quality compared to older formats like JPEG and PNG. We also support the advanced JPEG XL format, offering excellent compression and features like lossless recompression.
              </li>
              <li>
                <strong>Broad Format Compatibility:</strong> Convert between and compress images in popular formats including JPEG and PNG, ensuring compatibility across all browsers and devices.
              </li>
              <li>
                <strong>Significant File Size Reduction:</strong> Our advanced compression algorithms effectively shrink your image files, resulting in faster loading times and reduced bandwidth usage.
              </li>
              <li>
                <strong>Maintain Image Quality:</strong> We offer options for both lossy and lossless compression, allowing you to choose the perfect balance between file size reduction and visual fidelity.
              </li>
              <li>
                <strong>Browser-Based and User-Friendly:</strong> No software installation required. Optimize your images quickly and easily directly in your web browser.
              </li>
              <li>
                <strong>Fast and Efficient:</strong> Convert and compress your images rapidly, whether you're processing a single image or multiple files.
              </li>
            </ul>
            <h3 className="leading-none text-2xl font-semibold text-gray-800 mt-8 mb-4">Optimize Your Images for Better SEO and Faster Loading User Experiences</h3>
            <p className="text-lg text-gray-600">
              Using Imgsquash helps you implement key image SEO best practices. Reduced image sizes contribute to faster page load speeds, a critical ranking factor. By having optimized images, you improve user experience, which can lead to lower bounce rates and increased time spent on your site. Start optimizing your images today with Imgsquash and experience the benefits of a faster, higher-ranking website.
            </p>
          </article>

          <article className="p-8 bg-white rounded-2xl shadow-lg">
            <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">AVIF Image Format</h2>
            <p className="text-lg text-gray-600 mb-6">AVIF (AV1 Image File Format) is a next-generation format offering superior compression for web images.</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Positives</h3>
                <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
                  <li>Excellent compression: Smaller file sizes than JPEG and WebP.</li>
                  <li>High quality: Supports lossless and lossy compression.</li>
                  <li>Modern features: Transparency and wide color gamut.</li>
                </ul>
              </div>
              <div>
                <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Negatives</h3>
                <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
                  <li>Limited browser support: Not fully compatible with older browsers.</li>
                  <li>Slower encoding: Requires more processing power.</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-lg text-gray-600">Use AVIF for modern websites needing high-quality images with minimal file sizes. Compress AVIF files with Imgsquash.</p>
          </article>

          <article className="p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">JPEG Image Format</h2>
        <p className="text-lg text-gray-600 mb-6">JPEG (Joint Photographic Experts Group) is a widely used format for photos and web graphics.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Positives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Universal support: Compatible with all browsers and devices.</li>
              <li>Good compression: Reduces file sizes for fast loading.</li>
              <li>Versatile: Ideal for photographs and complex images.</li>
            </ul>
          </div>
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Negatives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Lossy compression: Quality degrades with heavy compression.</li>
              <li>No transparency: Not suitable for logos or overlays.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600">Use JPEG for photos on websites or social media. Optimize JPEGs with Imgsquash’s free JPEG compressor.</p>
      </article>

      <article className="p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">JPEG XL Image Format</h2>
        <p className="text-lg text-gray-600 mb-6">JPEG XL is an advanced format designed to replace JPEG with better compression and features.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Positives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Superior compression: Smaller files than JPEG with better quality.</li>
              <li>Lossless and lossy: Flexible for various use cases.</li>
              <li>Backward compatibility: Supports legacy JPEG decoding.</li>
            </ul>
          </div>
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Negatives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Emerging format: Limited browser support in 2025.</li>
              <li>Complex adoption: Requires updated software.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600">Use JPEG XL for future-proof web projects. Try compressing JPEG XL files with Imgsquash.</p>
      </article>

      <article className="p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">PNG Image Format</h2>
        <p className="text-lg text-gray-600 mb-6">PNG (Portable Network Graphics) is popular for web graphics requiring transparency.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Positives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Transparency support: Perfect for logos and overlays.</li>
              <li>Lossless compression: Maintains quality without degradation.</li>
              <li>Wide compatibility: Supported by all browsers.</li>
            </ul>
          </div>
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Negatives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Larger file sizes: Less efficient than AVIF or WebP.</li>
              <li>Not ideal for photos: Better for graphics than complex images.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600">Use PNG for logos or images needing transparency. Optimize PNGs with Imgsquash’s PNG compressor.</p>
      </article>

      <article className="p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="leading-none text-3xl font-bold text-gray-900 mb-6">WebP Image Format</h2>
        <p className="text-lg text-gray-600 mb-6">WebP is a modern format developed by Google for efficient web images.</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Positives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Efficient compression: Smaller files than JPEG and PNG.</li>
              <li>Transparency support: Similar to PNG but with smaller sizes.</li>
              <li>Lossy and lossless: Versatile for various needs.</li>
            </ul>
          </div>
          <div>
            <h3 className="leading-none text-xl font-semibold text-gray-800 mb-4">Negatives</h3>
            <ul className="leading-6 list-disc pl-6 text-lg text-gray-600 space-y-2">
              <li>Browser compatibility: Not supported by some older browsers.</li>
              <li>Conversion required: May need tools to convert from other formats.</li>
            </ul>
          </div>
        </div>
        <p className="mt-6 text-lg text-gray-600">Use WebP for fast-loading web images. Convert and compress WebP files with Imgsquash’s WebP converter.</p>
      </article>


        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why use imgSquash?</h2>
          <div className="space-y-4">
            {[
              {
                title: "Faster load times",
                content: "Reduce page loading times significantly by compressing images without sacrificing visual quality. Faster load speeds enhance user experience, improve SEO rankings, and ensure your website remains engaging for visitors across all devices."
              },
              {
                title: "Browser-based & private",
                content: "Our browser-based tool eliminates the need for software downloads, allowing you to compress and optimize images directly from your device. Accessible on any modern browser, it ensures seamless compatibility across platforms without compromising performance or quality."
              },
              {
                title: "Configurable options",
                content: "Tailor your image compression with configurable settings to balance quality and file size. Whether you're optimizing for web speed or print resolution, our tool provides precise control over output formats, quality levels, and advanced features like metadata removal."
              },
              {
                title: "One at a time or in bulk",
                content: "Process individual images for quick edits or upload multiple files simultaneously to batch optimize your media library. This flexibility makes it ideal for photographers, designers, and website owners who need efficient image management solutions."
              }
            ].map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === `item-${index}` ? null : `item-${index}`)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <span className="text-xl font-semibold text-gray-800">{item.title}</span>
                  <span className={`transform transition-transform ${activeAccordion === `item-${index}` ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </button>
                {activeAccordion === `item-${index}` && (
                  <div className="px-6 pb-4 text-lg text-gray-600">
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-gray-500">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} imgsquash.com. All rights reserved.
        </p>
        <p className="mt-2 text-xs">
          <a href='/privacy.html' target='_blank' className="hover:underline">Privacy Policy</a>
          <span className="mx-2">|</span>
          <a href='/terms.html' target='_blank' className="hover:underline">Terms of Use</a>
        </p>
      </footer>
    </div>
  );
}
