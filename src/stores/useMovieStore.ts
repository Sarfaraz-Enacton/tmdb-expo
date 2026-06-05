import { create } from "zustand";
import { Movie, AccountDetails, deleteSession, syncFavorite, syncWatchlist } from "../services/tmdb";
import { queryClient } from "../providers/QueryProvider";

interface MovieStoreState {
  // Auth state
  sessionId: string | null;
  requestToken: string | null;
  userAccount: AccountDetails | null;
  setSessionId: (id: string | null) => void;
  setRequestToken: (token: string | null) => void;
  setUserAccount: (account: AccountDetails | null) => void;
  logout: () => Promise<void>;

  // Favorites & Watchlist Lists (local/offline cache)
  favorites: Movie[];
  watchlist: Movie[];
  toggleFavorite: (movie: Movie) => Promise<void>;
  toggleWatchlist: (movie: Movie) => Promise<void>;
  isFavorite: (movieId: number) => boolean;
  isInWatchlist: (movieId: number) => boolean;
}

export const useMovieStore = create<MovieStoreState>((set, get) => ({
  sessionId: null,
  requestToken: null,
  userAccount: null,
  setSessionId: (id) => set({ sessionId: id }),
  setRequestToken: (token) => set({ requestToken: token }),
  setUserAccount: (account) => set({ userAccount: account }),
  logout: async () => {
    const { sessionId } = get();
    if (sessionId) {
      try {
        await deleteSession(sessionId);
      } catch (err) {
        console.error("Failed to delete session on TMDB server:", err);
      }
    }
    set({ sessionId: null, requestToken: null, userAccount: null });
  },

  favorites: [],
  watchlist: [],

  toggleFavorite: async (movie) => {
    const { favorites, sessionId, userAccount } = get();
    const isFav = favorites.some((m) => m.id === movie.id);

    // Optimistic update
    if (isFav) {
      set({ favorites: favorites.filter((m) => m.id !== movie.id) });
    } else {
      set({ favorites: [...favorites, movie] });
    }

    if (sessionId && userAccount) {
      try {
        const success = await syncFavorite(userAccount.id, sessionId, movie.id, !isFav);
        if (success) {
          queryClient.invalidateQueries({
            queryKey: ["onlineFavorites", userAccount.id, sessionId],
          });
        } else {
          console.error("Failed to sync favorite with TMDB");
          // Revert optimistic update
          if (isFav) {
            set({ favorites: [...favorites, movie] });
          } else {
            set({ favorites: favorites.filter((m) => m.id !== movie.id) });
          }
        }
      } catch (error) {
        console.error("Error toggling online favorite:", error);
        // Revert optimistic update
        if (isFav) {
          set({ favorites: [...favorites, movie] });
        } else {
          set({ favorites: favorites.filter((m) => m.id !== movie.id) });
        }
      }
    }
  },

  toggleWatchlist: async (movie) => {
    const { watchlist, sessionId, userAccount } = get();
    const isAdded = watchlist.some((m) => m.id === movie.id);

    // Optimistic update
    if (isAdded) {
      set({ watchlist: watchlist.filter((m) => m.id !== movie.id) });
    } else {
      set({ watchlist: [...watchlist, movie] });
    }

    if (sessionId && userAccount) {
      try {
        const success = await syncWatchlist(userAccount.id, sessionId, movie.id, !isAdded);
        if (success) {
          queryClient.invalidateQueries({
            queryKey: ["onlineWatchlist", userAccount.id, sessionId],
          });
        } else {
          console.error("Failed to sync watchlist with TMDB");
          // Revert optimistic update
          if (isAdded) {
            set({ watchlist: [...watchlist, movie] });
          } else {
            set({ watchlist: watchlist.filter((m) => m.id !== movie.id) });
          }
        }
      } catch (error) {
        console.error("Error toggling online watchlist:", error);
        // Revert optimistic update
        if (isAdded) {
          set({ watchlist: [...watchlist, movie] });
        } else {
          set({ watchlist: watchlist.filter((m) => m.id !== movie.id) });
        }
      }
    }
  },

  isFavorite: (movieId) => {
    return get().favorites.some((m) => m.id === movieId);
  },

  isInWatchlist: (movieId) => {
    return get().watchlist.some((m) => m.id === movieId);
  },
}));
