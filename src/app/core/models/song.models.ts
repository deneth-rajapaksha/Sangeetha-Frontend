export interface SongResponse {
  id: number;
  title: string;
  artist: string;
  songUrl: string;
  imageUrl: string;
  createdAt: string;
  appUserId: number;
  appUserName: string;
}

export interface SongRequest {
  title: string;
  artist: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
