import React, { useState, useEffect } from 'react';
import Gallery from './components/Gallery';
import Guestbook from './components/Guestbook';
import MediaPlayer from './components/MediaPlayer';
import { Heart, Upload, Play, X, Trash2 } from 'lucide-react';
import { VideoItem } from './types';

const App: React.FC = () => {
  const [particles, setParticles] = useState<{id: number, x: number, y: number}[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  
  // Load videos from local storage
  useEffect(() => {
    const saved = localStorage.getItem('grandpa-videos');
    if (saved) {
      try {
        setVideos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load videos");
      }
    }
  }, []);

  const spawnParticles = (x: number, y: number) => {
    const count = 10;
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 100,
        y: y + (Math.random() - 0.5) * 100
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVideo: VideoItem = {
          id: Date.now().toString(),
          url: reader.result as string,
          caption: "Vídeo Homenagem"
        };
        const updated = [newVideo, ...videos];
        
        try {
            localStorage.setItem('grandpa-videos', JSON.stringify(updated));
            setVideos(updated);
        } catch(e) {
            console.warn("Quota exceeded for video storage");
            alert("Vídeo muito grande para salvar permanentemente no armazenamento do navegador (Limite ~5MB).");
            setVideos(updated); // Update session state anyway
        }
        spawnParticles(window.innerWidth/2, window.innerHeight/2);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = (id: string) => {
    // Uso explícito de window.confirm
    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    try {
        localStorage.setItem('grandpa-videos', JSON.stringify(updated));
    } catch(e) {
        console.error("Erro ao salvar vídeos", e);
    }
    if (activeVideo?.id === id) {
        setActiveVideo(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 overflow-x-hidden font-sans">
      {/* Particles Rendering */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="fixed pointer-events-none text-gold-500 animate-ping z-[100]"
          style={{ left: p.x, top: p.y }}
        >
          <Heart className="w-6 h-6 fill-current" />
        </div>
      ))}

      {/* Hero Section */}
      <header className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-20 overflow-hidden bg-stone-900">
        
        {/* Creator Credit Top Left */}
        <div className="absolute top-6 left-6 z-20">
          <p className="text-gold-500 font-serif text-lg font-medium drop-shadow-md">Criado Por Edgar</p>
        </div>

        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-black/60"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto fade-in flex flex-col items-center" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-8 tracking-tight drop-shadow-xl">
            Álbum De <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-700">
              Recordações
            </span>
          </h1>

          {/* Video Upload Field */}
          <div className="mt-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 animate-fade-in hover:bg-white/15 transition-colors max-w-md mx-auto">
            <label className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 bg-gold-500 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" />
                </div>
                <span className="text-white font-serif text-lg font-medium">Vídeo Recordação</span>
                <span className="text-stone-300 text-sm mt-1">Clique para selecionar um arquivo</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={handleVideoUpload} 
                />
            </label>
          </div>

          {/* Video Gallery Grid - Click to Open Modal */}
          {videos.length > 0 && (
            <div className="mt-12 w-full animate-fade-in">
              <h2 className="text-xl font-serif text-white/90 mb-6 drop-shadow-md">Homenagens Enviadas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                  <div 
                    key={video.id} 
                    className="relative group rounded-xl overflow-hidden shadow-lg border border-white/10 transition-transform hover:-translate-y-1 bg-stone-900 cursor-pointer h-56"
                    onClick={() => setActiveVideo(video)}
                  >
                    {/* Thumbnail Video (Muted, Preview) */}
                    <video 
                        src={video.url} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                        muted
                    />
                    
                    {/* Big Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-xl">
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                        </div>
                    </div>

                    {/* Small Delete Button on Grid (Optional convenience) */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Tem certeza que deseja excluir este vídeo?')) {
                                removeVideo(video.id);
                            }
                        }}
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full z-20 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Excluir"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="p-3 text-left bg-black/60 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                        <p className="text-white/90 text-sm font-medium truncate">{video.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
            <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-4xl max-h-[90vh] aspect-video relative shadow-2xl rounded-xl overflow-hidden">
                <MediaPlayer 
                    src={activeVideo.url} 
                    type="video" 
                    className="w-full h-full"
                    autoPlay={true}
                    onDelete={() => removeVideo(activeVideo.id)}
                />
            </div>
        </div>
      )}

      <main>
        <section id="gallery">
          <Gallery onInteract={spawnParticles} />
        </section>

        <section id="guestbook" className="bg-gradient-to-b from-stone-50 to-stone-200">
          <Guestbook onInteract={spawnParticles} />
        </section>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-12 text-center border-t border-stone-800">
        <div className="container mx-auto px-4">
          <Heart className="w-8 h-8 text-gold-600 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-stone-200 mb-2">Com amor, sua família.</h3>
          <p className="text-gold-500 text-sm mt-2">Criado Por Edgar</p>
        </div>
      </footer>
    </div>
  );
};

export default App;