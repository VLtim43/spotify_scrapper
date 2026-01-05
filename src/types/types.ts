export type Playlist = {
  name: string;
  id: string;
  total: number;
  tracks: Track[];
};

export type Artist = {
  name: string;
  id: string;
};

export type Album = {
  name: string;
  id: string;
};

export type Track = {
  added_at: string;
  name: string;
  duration: string;
  album: Album[];
  artists: Artist[];
  id: string;
  isrc: string;
};
