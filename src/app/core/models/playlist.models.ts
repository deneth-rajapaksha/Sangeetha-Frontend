export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface PlaylistResponse {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  appUserId: number;
  appUserName: string;
}

export interface SongInPlaylist {
  songId: number;
  title: string;
  artist: string;
  songUrl: string;
  imageUrl: string;
  position: number;
  addedAt: string;
}

export interface PlaylistWithSongsResponse {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  appUserId: number;
  appUserName: string;
  songCount: number;
  songs: SongInPlaylist[];
}

export interface PlaylistRequest {
  name: string;
  description?: string;
  isPublic: boolean;
}
