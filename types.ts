export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  details: string; // Content for the modal
  iconType: 'star' | 'heart' | 'baby' | 'sun' | 'award';
}

export interface Message {
  id: string;
  author: string;
  text: string;
  date: string;
  audioData?: string; // Base64 string for the audio file
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
}

export interface AudioRecording {
  id: string;
  url: string;
  date: string;
}

export interface VideoItem {
  id: string;
  url: string;
  caption?: string;
}