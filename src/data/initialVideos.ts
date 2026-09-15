import { VideoItem, PhotoItem, AudioItem, CategoryInfo } from '../types';
import mindStateImage from '../assets/images/Mind-State.jpeg';
import selfPleasureImage from '../assets/images/Self-Pleasure.jpeg';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [];

export const INITIAL_VIDEOS: VideoItem[] = [
  
  {
    id: 'vid-aarti-paramahamsa-vishwananda',
    youtubeId: 'A4JcViRiWvE',
    url: 'https://www.youtube.com/watch?v=A4JcViRiWvE',
    title: 'श्री स्वामी विश्वानन्द आरती',
    channelTitle: 'Bhakti Marga',
    category: 'आरती',
    tags: ['आरती', 'Aarti', 'Bhakti Marga', 'Swami Vishwananda', 'भक्ती मार्ग'],
    notes: 'परमहंस श्री स्वामी विश्वानन्द आरती',
    timestamps: [],
    isFavorite: true,
    isWatchLater: false,
    createdAt: '2025-01-05T12:00:00.000Z',
    thumbnailUrl: 'https://img.youtube.com/vi/A4JcViRiWvE/hqdefault.jpg',
  },
  {
    id: 'vid-aarti-preetam-pyari-ki-jkp',
    youtubeId: 'Ywd9xNcvAFM',
    url: 'https://www.youtube.com/watch?v=Ywd9xNcvAFM',
    title: 'आरती प्रीतम प्यारी की',
    channelTitle: 'Jagadguru Kripalu Parishat',
    category: 'आरती',
    tags: ['आरती', 'Aarti', 'JKP', 'Radha Rani', 'Bhakti Mandir'],
    notes: 'आरती प्रीतम प्यारी की',
    timestamps: [],
    isFavorite: true,
    isWatchLater: false,
    createdAt: '2025-01-03T00:00:00.000Z',
    thumbnailUrl: 'https://img.youtube.com/vi/Ywd9xNcvAFM/hqdefault.jpg',
  },
  {
    id: 'vid-aarti-preetam-pyari-ki-anuradha',
    youtubeId: 'Fql0RCRyFO0',
    url: 'https://www.youtube.com/watch?v=Fql0RCRyFO0',
    title: 'आरती जगद्गुरु की',
    channelTitle: 'Anuradha Paudwal',
    category: 'आरती',
    tags: ['आरती', 'Aarti', 'Radha Krishna', 'Anuradha Paudwal'],
    notes: 'आरती जगद्गुरु की',
    timestamps: [],
    isFavorite: true,
    isWatchLater: false,
    createdAt: '2025-01-04T00:00:00.000Z',
    thumbnailUrl: 'https://img.youtube.com/vi/Fql0RCRyFO0/hqdefault.jpg',
  },
  
];

export const INITIAL_PHOTOS: PhotoItem[] = [
  {
    id: 'photo-mind-state',
    title: 'Mind-State',
    category: 'इतर',
    photoUrl: mindStateImage,
    thumbnailUrl: mindStateImage,
    isFavorite: false,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'photo-self-pleasure',
    title: 'Self-Pleasure',
    category: 'इतर',
    photoUrl: selfPleasureImage,
    thumbnailUrl: selfPleasureImage,
    isFavorite: false,
    createdAt: '2026-09-15T00:01:00.000Z',
  },
];

export const INITIAL_AUDIOS: AudioItem[] = [
  {
    id: 'audio-prabhupad-morning-walk',
    sourceType: 'drive',
    driveId: '1xNNgzmX8ilmOtoX2TzLET3fQpP2DTJ4T',
    url: 'https://drive.google.com/file/d/1xNNgzmX8ilmOtoX2TzLET3fQpP2DTJ4T/view?usp=sharing',
    title: 'Prabhupad Morning Walk',
    artistOrSource: 'Google Drive Audio',
    category: 'इतर',
    isFavorite: false,
    createdAt: '2026-09-15T00:03:00.000Z',
  },
  {
    id: 'audio-other-drive-1',
    sourceType: 'drive',
    driveId: '1q9OO1ROTcUZJlsH5TuPbgTMkUMdcihdS',
    url: 'https://drive.google.com/file/d/1q9OO1ROTcUZJlsH5TuPbgTMkUMdcihdS/view?usp=drive_link',
    title: 'Stability',
    artistOrSource: 'Google Drive Audio',
    category: 'इतर',
    isFavorite: false,
    createdAt: '2026-09-15T00:00:00.000Z',
  },
  {
    id: 'audio-other-drive-2',
    sourceType: 'drive',
    driveId: '1AJDQc5ViSiOa9Xi0IcdkLfcQHsqhu6VY',
    url: 'https://drive.google.com/file/d/1AJDQc5ViSiOa9Xi0IcdkLfcQHsqhu6VY/view?usp=drive_link',
    title: 'Marriage – Depression',
    artistOrSource: 'Google Drive Audio',
    category: 'इतर',
    isFavorite: false,
    createdAt: '2026-09-15T00:01:00.000Z',
  },
  {
    id: 'audio-other-drive-3',
    sourceType: 'drive',
    driveId: '1GcJjZoVsxS53tZ4yrW5oTybsb_WH1ub7',
    url: 'https://drive.google.com/file/d/1GcJjZoVsxS53tZ4yrW5oTybsb_WH1ub7/view?usp=drive_link',
    title: 'Maharajis on Marriage',
    artistOrSource: 'Google Drive Audio',
    category: 'इतर',
    isFavorite: false,
    createdAt: '2026-09-15T00:02:00.000Z',
  },
];
