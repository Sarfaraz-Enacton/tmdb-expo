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
