import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { Send, Mic, Square, Upload, Trash2 } from 'lucide-react';
import MediaPlayer from './MediaPlayer';

interface GuestbookProps {
  onInteract: (x: number, y: number) => void;
}

const Guestbook: React.FC<GuestbookProps> = ({ onInteract }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('grandpa-messages');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  // Convert Blob to Base64 to save in LocalStorage
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioBlob) {
        alert("Por favor, grave ou carregue um áudio para enviar a homenagem.");
        return;
    }

    let processedAudio: string | undefined = undefined;

    // Process audio
    try {
        processedAudio = await blobToBase64(audioBlob);
    } catch (err) {
        console.error("Erro ao processar áudio", err);
        return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      author: 'Mensagem de Voz', 
      text: 'Mensagem de Voz', // Texto padrão interno
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }),
      audioData: processedAudio
    };

    const updated = [newMessage, ...messages];
    setMessages(updated);
    
    try {
        localStorage.setItem('grandpa-messages', JSON.stringify(updated));
    } catch (e) {
        console.warn("Quota exceeded for messages/audio");
        alert("Atenção: O armazenamento local está cheio. O áudio pode não ser salvo permanentemente.");
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    
    const rect = (e.target as Element).getBoundingClientRect();
    onInteract(rect.left + rect.width / 2, rect.top);
  };

  const handleDeleteAudio = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir o áudio desta mensagem?')) {
        const updated = messages.map(msg => {
            if (msg.id === id) {
                return { ...msg, audioData: undefined };
            }
            return msg;
        });
        setMessages(updated);
        try {
            localStorage.setItem('grandpa-messages', JSON.stringify(updated));
        } catch (e) {
            console.error("Erro ao atualizar localStorage", e);
        }
    }
  };

  const handleDeleteRecord = (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir este registro permanentemente?')) {
          const updated = messages.filter(msg => msg.id !== id);
          setMessages(updated);
          try {
              localStorage.setItem('grandpa-messages', JSON.stringify(updated));
          } catch (e) {
              console.error("Erro ao atualizar localStorage", e);
          }
      }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microfone não disponível ou permissão negada.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100">
        <div className="p-8 md:p-12 bg-gradient-to-br from-stone-800 to-stone-900 text-white text-center">
          <h2 className="text-3xl font-serif font-bold mb-4">Livro de Visitas</h2>
          <p className="text-stone-300">Grave uma mensagem de voz para eternizar este momento.</p>
        </div>

        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <form onSubmit={handleSendMessage} className="space-y-6">
              
              {/* Audio Recorder/Upload Widget */}
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <p className="text-sm font-medium text-stone-600 mb-3">Gravar ou Escolher Áudio (Obrigatório)</p>
                {!audioUrl ? (
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex items-center justify-center w-full gap-2 py-3 rounded-lg transition-all font-medium ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'}`}
                    >
                      {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                      <span>{isRecording ? 'Parar Gravação' : 'Gravar Mensagem de Voz'}</span>
                    </button>
                    
                    {!isRecording && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="h-px bg-stone-200 flex-1"></span>
                          <span className="text-xs text-stone-400 font-medium px-2">OU</span>
                          <span className="h-px bg-stone-200 flex-1"></span>
                        </div>

                        <label className="flex items-center justify-center w-full gap-2 py-3 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 cursor-pointer transition-all font-medium">
                          <Upload className="w-5 h-5" />
                          <span>Carregar Arquivo de Áudio</span>
                          <input 
                            type="file" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={handleAudioUpload} 
                          />
                        </label>
                      </>
                    )}
                  </div>
                ) : (
                   <div className="flex flex-col gap-3">
                      <MediaPlayer 
                        src={audioUrl} 
                        type="audio" 
                        onDelete={deleteRecording}
                      />
                   </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={!audioUrl}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${!audioUrl ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-gold-500 hover:bg-gold-600 text-white hover:shadow-xl'}`}
              >
                <Send className="w-5 h-5" />
                <span>Enviar Áudio</span>
              </button>
            </form>
          </div>

          {/* List */}
          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-stone-400">
                <p>Nenhum áudio enviado ainda.</p>
                <p className="text-sm">Seja o primeiro a gravar uma mensagem!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 relative hover:bg-amber-50 transition-colors group">
                  <div className="flex justify-between items-start mb-3 pr-2">
                    <div>
                        <span className="text-xs text-stone-400 block mb-1">{msg.date}</span>
                    </div>
                  </div>
                  
                  {msg.audioData ? (
                    <div className="mt-1">
                        <MediaPlayer 
                            src={msg.audioData} 
                            type="audio" 
                            onDelete={() => handleDeleteAudio(msg.id)}
                        />
                    </div>
                  ) : (
                     <div className="mt-1 flex items-center justify-between p-3 bg-stone-100 rounded-lg border border-stone-200 border-dashed">
                        <span className="text-sm text-stone-500 italic">Áudio removido</span>
                        <button
                             type="button"
                             onClick={() => handleDeleteRecord(msg.id)}
                             className="p-2 text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                             title="Excluir registro permanentemente"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guestbook;