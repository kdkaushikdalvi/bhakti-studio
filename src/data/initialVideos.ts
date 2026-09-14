import { VideoItem, PhotoItem, AudioItem, CategoryInfo } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [];

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'vid-aarti-preetam-pyari-ki',
    youtubeId: 'Fql0RCRyFO0',
    url: 'https://www.youtube.com/watch?v=Fql0RCRyFO0',
    title: 'आरती प्रीतम प्यारी की | Aarti Preetam Pyari Ki - Anuradha Paudwal',
    channelTitle: 'Anuradha Paudwal',
    category: 'आरती',
    tags: ['आरती', 'Aarti', 'Radha Krishna', 'Anuradha Paudwal'],
    notes: 'आरती प्रीतम प्यारी की, कीजै जुगल युगल छवि प्यारी की।',
    timestamps: [],
    isFavorite: true,
    isWatchLater: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    thumbnailUrl: 'https://img.youtube.com/vi/Fql0RCRyFO0/hqdefault.jpg',
  },
];

export const INITIAL_PHOTOS: PhotoItem[] = [];

export const INITIAL_AUDIOS: AudioItem[] = [];


