import React, { useState, useRef, useEffect } from 'react';
import { GalleryImage } from '../types';
import { Camera, X, Upload, ChevronLeft, ChevronRight, Play, Pause, Download, Trash2 } from 'lucide-react';

interface GalleryProps {
  onInteract: (x: number, y: number) => void;
}

const Gallery: React.FC<GalleryProps> = ({ onInteract }) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slideshowInterval = useRef<number | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('grandpa-gallery');
    if (saved) {
      try {
        setImages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load images", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    // Only save if we have images or if we need to clear (empty array)
    // We check against the initial load to avoid overwriting with empty array on first render before load
    // But since we load in a separate useEffect with [], this runs after.
    try {
        // Removed .slice(-10) to persist ALL images
        localStorage.setItem('grandpa-gallery', JSON.stringify(images));
    } catch (e) {
        console.warn("Storage quota exceeded, images not saved permanently.");
        // We don't alert here constantly to avoid spamming the user on every render, 
        // but the add function handles the initial alert.
    }
  }, [images]);

  useEffect(() => {
    if (isSlideshow && lightboxIndex !== null) {
      slideshowInterval.current = window.setInterval(() => {
        setLightboxIndex(prev => {
          if (prev === null) return null;
          return (prev + 1) % images.length;
        });
      }, 3000);
    } else {
      if (slideshowInterval.current) clearInterval(slideshowInterval.current);
    }
    return () => {
      if (slideshowInterval.current) clearInterval(slideshowInterval.current);
    };
  }, [isSlideshow, images.length, lightboxIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: GalleryImage = {
          id: Date.now().toString(),
          url: reader.result as string,
          caption: "Nova foto adicionada"
        };
        
        // Try to save immediately to check quota
        try {
            const potentialNewState = [newImage, ...images];
            localStorage.setItem('grandpa-gallery', JSON.stringify(potentialNewState));
            // If successful, update state
            setImages(potentialNewState);
            onInteract(window.innerWidth / 2, window.innerHeight / 2);
        } catch (error) {
            alert("Espaço de armazenamento cheio! Esta foto não será salva permanentemente.");
            // We still update state so user sees it in current session
            setImages(prev => [newImage, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta foto?')) {
      const updated = images.filter(img => img.id !== id);
      setImages(updated);
      try {
         localStorage.setItem('grandpa-gallery', JSON.stringify(updated));
      } catch(err) {
          console.error("Error updating storage after delete");
      }

      if (lightboxIndex !== null) {
        setLightboxIndex(null);
      }
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsSlideshow(false);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="bg-stone-100 py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-800">Galeria da Família</h2>
            <p className="text-stone-500 mt-2">Clique para ampliar ou adicione sua foto.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 md:mt-0 flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-full hover:bg-stone-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>Adicionar Foto</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
        </div>

        {images.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-stone-300 rounded-xl">
            <p className="text-stone-400 text-lg">Nenhuma foto adicionada ainda.</p>
            <p className="text-stone-400 text-sm mt-1">Seja o primeiro a compartilhar uma memória!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div 
                key={img.id} 
                className="aspect-square relative group overflow-hidden rounded-xl cursor-pointer shadow-sm hover:shadow-lg transition-all"
                onClick={() => openLightbox(idx)}
              >
                <img 
                  src={img.url} 
                  alt={img.caption || 'Foto da família'} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => deleteImage(img.id, e)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-100 transition-all shadow-md z-20 cursor-pointer"
                  title="Excluir foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          
          <a
            href={images[lightboxIndex].url}
            download={`foto-${images[lightboxIndex].id}`}
            onClick={(e) => e.stopPropagation()}
            className="absolute top-6 left-6 text-white/70 hover:text-white transition-colors"
            title="Baixar imagem"
          >
            <Download className="w-8 h-8" />
          </a>

           {/* Delete Button inside Lightbox */}
           <button
            type="button"
            onClick={(e) => deleteImage(images[lightboxIndex].id, e)}
            className="absolute top-6 left-20 ml-4 text-red-400 hover:text-red-500 transition-colors z-50 cursor-pointer"
            title="Excluir imagem"
          >
            <Trash2 className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl h-[80vh] flex items-center justify-center">
             <button 
              onClick={prevImage}
              className="absolute left-2 md:-left-12 p-2 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-full"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            
            <img 
              src={images[lightboxIndex].url} 
              className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
              alt="Ampliada"
            />

            <button 
              onClick={nextImage}
              className="absolute right-2 md:-right-12 p-2 text-white/70 hover:text-white transition-colors hover:bg-white/10 rounded-full"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsSlideshow(!isSlideshow);
                }}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/20"
            >
                {isSlideshow ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isSlideshow ? 'Pausar' : 'Apresentação'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;