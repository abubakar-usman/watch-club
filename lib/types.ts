export interface StreamingOption {
  service?: {
    id?: string;
    name: string;
    homePage?: string;
    themeColorCode?: string;
    imageSet?: {
      lightThemeImage?: string;
      darkThemeImage?: string;
      whiteImage?: string;
    };
  };
  type: string;
  link?: string;
  videoQuality?: string;
  price?: {
    amount?: string | number;
    currency?: string;
    formatted?: string;
  };
  audios?: { language: string }[];
  subtitles?: { language: string }[];
  expiresOn?: number;
  [key: string]: any;
}

export interface CastMember {
  id?: string | number;
  name: string;
  character?: string;
  profilePath?: string | null;
  [key: string]: any;
}

export interface Movie {
  id: string | number;
  title: string;
  posterUrl: string | null;
  overview: string;
  releaseDate: string;
  cast: string[] | CastMember[];
  streamingOptions?: Record<string, StreamingOption[]> | StreamingOption[] | any;

  // Additional optional compatibility fields
  release_date?: string;
  poster?: string | null;
  poster_path?: string | null;
  backdrop?: string | null;
  backdrop_path?: string | null;
  backdropUrl?: string | null;
  user_rating?: number;
  vote_average?: number;
  vote_count?: number;
  year?: number;
  genres?: { id: number | string; name: string }[];
  genre_names?: string[];
  sources?: any[];
  credits?: {
    cast: any[];
    crew: any[];
  };
  release_dates?: {
    results?: any[];
  };
}

export interface TrendingResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface SearchResponse {
  results: Movie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface MovieProvider {
  fetchTrending(
    timeWindow?: string,
    page?: number,
    limit?: number
  ): Promise<TrendingResponse>;

  fetchDetails(id: string | number): Promise<Movie | null>;
  search(query: string, page?: number): Promise<SearchResponse>;
}
