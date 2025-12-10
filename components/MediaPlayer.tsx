import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, RotateCw, Maximize, Minimize, Trash2 } from 'lucide-react';

interface MediaPlayerProps {
  src: string;
  type: 'video' | 'audio';
  className?: string;
  poster?: string; // Para vídeos (opcional)
  onDelete?: () => void; // Callback para exclusão
  autoPlay?: boolean; // Nova propriedade
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ src, type, className = '', poster, onDelete, autoPlay = false }) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitora mudanças de fullscreen (ex: via ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Formata segundos em MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Evita conflitos de clique
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      const current = mediaRef.current.currentTime;
      const total = mediaRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
      
      if (current === total) {
        setIsPlaying(false);
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Importante para não arrastar elementos pai se houver drag
    if (mediaRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      mediaRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const skipTime = (seconds: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Garante que o estado de play/pause esteja sincronizado (ex: se o vídeo pausar sozinho ao acabar)
  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  return (
    <div 
      ref={containerRef}
      className={`relative group bg-stone-900 rounded-xl overflow-hidden shadow-lg border border-stone-800 ${className} ${isFullscreen ? 'rounded-none border-none' : ''}`}
    >
      
      {/* Botão de Excluir no Canto Superior Direito (Apenas para Áudio) */}
      {type === 'audio' && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if(window.confirm('Tem certeza que deseja excluir?')) {
               onDelete();
            }
          }}
          className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-50 cursor-pointer"
          title="Excluir áudio"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Elemento de Mídia */}
      {type === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={src}
          className={`w-full h-full object-contain bg-black ${isFullscreen ? 'max-h-screen' : ''}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          playsInline
          autoPlay={autoPlay}
          onClick={togglePlay}
          poster={poster}
        />
      ) : (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={src}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          autoPlay={autoPlay}
        />
      )}

      {/* Controles Overlay (Para vídeo, aparece em cima / Para áudio, é a interface principal) */}
      <div 
        className={`
          flex flex-col justify-end transition-opacity duration-300
          ${type === 'video' ? 'absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100' : 'relative p-3 bg-stone-100'}
        `}
        onClick={(e) => type === 'video' && togglePlay(e)} // No video, clicar no fundo dá play/pause
      >
        <div 
          className="p-3 w-full" 
          onClick={(e) => e.stopPropagation()} // Impede que clicar nos controles dê play/pause no video background
        >
          {/* Barra de Progresso */}
          <div className="flex items-center gap-3 mb-2">
             <span className={`text-xs font-mono ${type === 'video' ? 'text-white' : 'text-stone-600'}`}>
               {formatTime(currentTime)}
             </span>
             <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onChange={handleProgressChange}
              className="flex-1 h-1.5 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-gold-500 hover:accent-gold-400"
            />
            <span className={`text-xs font-mono ${type === 'video' ? 'text-white' : 'text-stone-600'}`}>
               {formatTime(duration)}
            </span>
          </div>

          {/* Botões de Controle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className={`p-2 rounded-full transition-all ${type === 'video' ? 'text-white hover:bg-white/20' : 'text-stone-800 hover:bg-stone-200'}`}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Seek Buttons */}
              <button 
                onClick={(e) => skipTime(-10, e)}
                className={`hidden sm:block p-1.5 rounded-full transition-all ${type === 'video' ? 'text-white/80 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}
                title="-10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => skipTime(10, e)}
                className={`hidden sm:block p-1.5 rounded-full transition-all ${type === 'video' ? 'text-white/80 hover:text-white' : 'text-stone-500 hover:text-stone-800'}`}
                title="+10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Volume */}
              <div 
                  className="flex items-center gap-2 relative"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
              >
                {showVolume && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1.5 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-gold-500 absolute bottom-8 left-1/2 -translate-x-1/2 rotate-0 origin-left"
                  />
                )}
                <button 
                  onClick={toggleMute}
                  className={`p-2 rounded-full ${type === 'video' ? 'text-white hover:bg-white/20' : 'text-stone-800 hover:bg-stone-200'}`}
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {/* Fullscreen Button (Only for Video) */}
              {type === 'video' && (
                <button 
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full text-white hover:bg-white/20 transition-all"
                  title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              )}

               {/* Delete Button - Only renders for VIDEO here (Audio is handled at top right) */}
               {onDelete && type === 'video' && (
                <>
                  <div className={`w-px h-4 mx-1 ${type === 'video' ? 'bg-white/30' : 'bg-stone-300'}`}></div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if(window.confirm('Tem certeza que deseja excluir este vídeo?')) {
                         onDelete();
                      }
                    }}
                    className={`p-2 rounded-full transition-colors z-50 cursor-pointer ${type === 'video' ? 'text-white hover:text-red-400 hover:bg-white/10' : 'text-stone-500 hover:text-red-500 hover:bg-red-50'}`}
                    title="Excluir"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Play Button Overlay (Só aparece quando pausado no modo vídeo) */}
      {type === 'video' && !isPlaying && (
        <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            <div className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
            </div>
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;