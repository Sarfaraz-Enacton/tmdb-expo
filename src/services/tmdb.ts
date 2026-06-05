const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface MovieDetails extends Movie {
  tagline: string | null;
  genres: { id: number; name: string }[];
  runtime: number | null;
  budget: number;
  revenue: number;
  status: string;
  imdb_id: string | null;
  homepage: string | null;
  production_companies: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  spoken_languages: {
    english_name: string;
    iso_639_1: string;
    name: string;
  }[];
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

// Fallback high-quality mock movies in case API token is missing/invalid
export const MOCK_MOVIES: Movie[] = [
  {
    id: 101,
    title: "Dune: Part Two",
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    poster_path: "/cz8k2V48w5n44Vsy5Yk8gD5C924.jpg",
    backdrop_path: "/xOMo8BRK7Pzs9v61J7fCJD6e0v2.jpg",
    release_date: "2024-02-27",
    vote_average: 8.3,
  },
  {
    id: 102,
    title: "Inside Out 2",
    overview:
      "Teenager Riley's mind headquarters undergoes a sudden demolition to make room for something entirely unexpected: new Emotions!",
    poster_path: "/vpnVM9B62m44mYLxZ0uGlHGxAQY.jpg",
    backdrop_path: "/stKG8fs5kZOBd0vfg2RCzXRT3IP.jpg",
    release_date: "2024-06-11",
    vote_average: 7.6,
  },
  {
    id: 103,
    title: "Spider-Man: Across the Spider-Verse",
    overview:
      "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse.",
    poster_path: "/8Gxv2wS6mJ6D9Qv0z5cQ7Zrqf6y.jpg",
    backdrop_path: "/4MCKex2vzwccvjXzW2n565U32r4.jpg",
    release_date: "2023-05-31",
    vote_average: 8.4,
  },
  {
    id: 104,
    title: "Oppenheimer",
    overview:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
    poster_path: "/8Gxv2wS6mJ6D9Qv0z5cQ7Zrqf6y.jpg", // Fallback poster
    backdrop_path: "/rM6156v6RjR6Px2XZ1UdfZ9J1z3.jpg",
    release_date: "2023-07-19",
    vote_average: 8.1,
  },
  {
    id: 105,
    title: "Interstellar",
    overview:
      "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
    poster_path: "/gEU2Qv6e37oST723vQ38clBz283.jpg",
    backdrop_path: "/xJHokn84oQu948v68lK34nSStpa.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
  },
  {
    id: 106,
    title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tWGB2X2mR78VA2vsiwS3X35S.jpg",
    backdrop_path: "/nMKdUUepdz8gZ50K71wKyPdIMNt.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
  },
];

export const getImageUrl = (path: string | null): string => {
  if (!path)
    return "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";
  if (path.startsWith("http")) return path;
  return `${IMAGE_BASE_URL}${path}`;
};

const getHeaders = () => {
  const token = process.env.EXPO_PUBLIC_TMDB_API_TOKEN;
  if (!token || token === "YOUR_TMDB_API_READ_ACCESS_TOKEN") {
    return null;
  }
  return {
    accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getAuthHeaders = () => {
  const token = process.env.EXPO_PUBLIC_TMDB_API_TOKEN;
  if (!token || token === "YOUR_TMDB_API_READ_ACCESS_TOKEN") {
    return null;
  }
  return {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const fetchMovies = async (
  endpoint: string,
  params: Record<string, string> = {},
): Promise<Movie[]> => {
  const headers = getHeaders();

  // If there's no custom token configured, use the mock fallback
  if (!headers) {
    console.warn(
      "TMDB API Read Access Token is not set in .env. Falling back to mock data.",
    );
    // Filter mock data locally if search query is provided
    if (endpoint.includes("search/movie") && params.query) {
      const query = params.query.toLowerCase();
      return MOCK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.overview.toLowerCase().includes(query),
      );
    }
    return MOCK_MOVIES;
  }

  try {
    const urlParams = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}${urlParams ? `?${urlParams}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMDBResponse = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching movies from ${endpoint}:`, error);
    // Graceful fallback to mock data on network error
    return MOCK_MOVIES;
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  const headers = getHeaders();
  if (!headers) {
    console.warn(`No authorization header. Falling back to mock movie details for ID ${id}.`);
    const mock = MOCK_MOVIES.find((m) => m.id === id) || {
      id,
      title: `Mock Movie ${id}`,
      overview: "This is a placeholder details overview for the selected mock movie since no API token was provided.",
      poster_path: null,
      backdrop_path: null,
      release_date: "2024-01-01",
      vote_average: 7.0,
    };
    return {
      ...mock,
      tagline: "Every line will be crossed.",
      genres: [
        { id: 35, name: "Comedy" },
        { id: 27, name: "Horror" }
      ],
      runtime: 95,
      budget: 30000000,
      revenue: 166601860,
      status: "Released",
      imdb_id: "tt32093575",
      homepage: "https://www.scarymovie.film",
      production_companies: [
        { id: 14, logo_path: null, name: "Miramax", origin_country: "US" },
        { id: 157300, logo_path: null, name: "Ugly Baby Productions", origin_country: "US" }
      ],
      production_countries: [{ iso_3166_1: "US", name: "United States of America" }],
      spoken_languages: [{ english_name: "English", iso_639_1: "en", name: "English" }]
    };
  }

  try {
    const response = await fetch(`${BASE_URL}/movie/${id}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MovieDetails = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${id}:`, error);
    const mock = MOCK_MOVIES.find((m) => m.id === id) || {
      id,
      title: `Mock Movie ${id}`,
      overview: "Fallback details overview for offline/error state.",
      poster_path: null,
      backdrop_path: null,
      release_date: "2024-01-01",
      vote_average: 7.0,
    };
    return {
      ...mock,
      tagline: "Every line will be crossed.",
      genres: [
        { id: 35, name: "Comedy" },
        { id: 27, name: "Horror" }
      ],
      runtime: 95,
      budget: 30000000,
      revenue: 166601860,
      status: "Released",
      imdb_id: "tt32093575",
      homepage: "https://www.scarymovie.film",
      production_companies: [
        { id: 14, logo_path: null, name: "Miramax", origin_country: "US" }
      ],
      production_countries: [{ iso_3166_1: "US", name: "United States of America" }],
      spoken_languages: [{ english_name: "English", iso_639_1: "en", name: "English" }]
    };
  }
};

export const getTrendingMovies = (): Promise<Movie[]> => {
  return fetchMovies("/trending/movie/day");
};

export const getPopularMovies = (): Promise<Movie[]> => {
  return fetchMovies("/movie/popular");
};

export const getTopRatedMovies = (): Promise<Movie[]> => {
  return fetchMovies("/movie/top_rated");
};

export const searchMovies = (query: string): Promise<Movie[]> => {
  if (!query.trim()) return Promise.resolve([]);
  return fetchMovies("/search/movie", { query });
};

export interface AccountDetails {
  id: number;
  name: string;
  username: string;
  include_adult: boolean;
  iso_639_1: string;
  iso_3166_1: string;
  avatar: {
    gravatar: {
      hash: string;
    };
    tmdb: {
      avatar_path: string | null;
    };
  };
}

export const validateApiKey = async (): Promise<boolean> => {
  const headers = getHeaders();
  if (!headers) return false;
  try {
    const response = await fetch(`${BASE_URL}/authentication`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
};

export const createRequestToken = async (): Promise<string | null> => {
  const headers = getHeaders();
  if (!headers) return null;
  try {
    const response = await fetch(`${BASE_URL}/authentication/token/new`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.request_token : null;
  } catch (error) {
    console.error("Error creating request token:", error);
    return null;
  }
};

export const createSession = async (requestToken: string): Promise<string | null> => {
  const headers = getAuthHeaders();
  if (!headers) return null;
  try {
    const response = await fetch(`${BASE_URL}/authentication/session/new`, {
      method: "POST",
      headers,
      body: JSON.stringify({ request_token: requestToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.success ? data.session_id : null;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

export const deleteSession = async (sessionId: string): Promise<boolean> => {
  const headers = getAuthHeaders();
  if (!headers) return false;
  try {
    const response = await fetch(`${BASE_URL}/authentication/session`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
};

export const getAccountDetails = async (sessionId: string): Promise<AccountDetails | null> => {
  const headers = getHeaders();
  if (!headers) return null;
  try {
    const response = await fetch(`${BASE_URL}/account?session_id=${sessionId}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return null;
    const data: AccountDetails = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting account details:", error);
    return null;
  }
};

export const getFavoriteMovies = async (accountId: number, sessionId: string): Promise<Movie[]> => {
  const headers = getHeaders();
  if (!headers) return [];
  try {
    const response = await fetch(`${BASE_URL}/account/${accountId}/favorite/movies?session_id=${sessionId}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error getting favorite movies:", error);
    return [];
  }
};

export const getWatchlistMovies = async (accountId: number, sessionId: string): Promise<Movie[]> => {
  const headers = getHeaders();
  if (!headers) return [];
  try {
    const response = await fetch(`${BASE_URL}/account/${accountId}/watchlist/movies?session_id=${sessionId}`, {
      method: "GET",
      headers,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error getting watchlist movies:", error);
    return [];
  }
};

export const syncFavorite = async (
  accountId: number,
  sessionId: string,
  movieId: number,
  favorite: boolean
): Promise<boolean> => {
  const headers = getAuthHeaders();
  if (!headers) return false;
  try {
    const response = await fetch(`${BASE_URL}/account/${accountId}/favorite?session_id=${sessionId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        media_type: "movie",
        media_id: movieId,
        favorite,
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error syncing favorite:", error);
    return false;
  }
};

export const syncWatchlist = async (
  accountId: number,
  sessionId: string,
  movieId: number,
  watchlist: boolean
): Promise<boolean> => {
  const headers = getAuthHeaders();
  if (!headers) return false;
  try {
    const response = await fetch(`${BASE_URL}/account/${accountId}/watchlist?session_id=${sessionId}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        media_type: "movie",
        media_id: movieId,
        watchlist,
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error syncing watchlist:", error);
    return false;
  }
};
