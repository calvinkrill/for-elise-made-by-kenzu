export interface EnvelopeData {
  id: number;
  label: string;
  question: string;
  answer: string;
  highlight?: string;
  iconType: 'tulip' | 'peace' | 'family' | 'love' | 'heart';
}

export interface PolaroidData {
  id: number;
  title: string;
  subtitle: string;
  imageSrc: string;
  emoji: string;
  rotation: number; // degrees to tilt polaroid
}

export interface AmbientState {
  rainEnabled: boolean;
  activeBgTheme: 'default' | 'peaceful-sky' | 'sunset-beach' | 'late-afternoon';
  bloomActive: boolean;
  musicPlaying: boolean;
  rainOpacity: number;
}
