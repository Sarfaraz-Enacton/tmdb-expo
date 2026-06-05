import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import {
  Input,
  Spinner,
  Tabs,
  Typography,
} from "heroui-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  searchMovies,
} from "../services/tmdb";
import { useMovieStore } from "../stores/useMovieStore";
import { MovieCard } from "../components/MovieCard";

export default function Index() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("trending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Zustand state
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);

  // Debounce search input
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // React Query for movie fetching
  const { data: movies = [], isLoading } = useQuery({
    queryKey: debouncedSearch.trim()
      ? ["movies", "search", debouncedSearch]
      : ["movies", activeTab],
    queryFn: () => {
      if (debouncedSearch.trim()) {
        return searchMovies(debouncedSearch);
      }
      if (activeTab === "trending") {
        return getTrendingMovies();
      }
      if (activeTab === "popular") {
        return getPopularMovies();
      }
      return getTopRatedMovies();
    },
  });

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* Header Section */}
      <View className="px-5 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-zinc-100 shadow-sm">
        <Typography
          type="h3"
          weight="bold"
          className="text-indigo-600 text-2xl tracking-tight"
        >
          {t("appName")}
        </Typography>
      </View>

      {/* Explore Screen Content */}
      {/* Search Bar Input */}
      <View className="px-4 py-2 bg-white">
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("searchPlaceholder")}
        />
      </View>

      {/* Categories Tabs Filter */}
      {!searchQuery && (
        <View className="px-4 py-2 items-center bg-white border-b border-zinc-100">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="text-sm">
              <Tabs.Indicator />
              <Tabs.Trigger value="trending">
                <Tabs.Label>{t("trending")}</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="popular">
                <Tabs.Label>{t("popular")}</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="top_rated">
                <Tabs.Label>{t("topRated")}</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </View>
      )}

      {/* Movie Content Area */}
      <ScrollView
        className="flex-grow pb-8"
        contentContainerClassName="flex-grow pb-40"
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Spinner size="lg" color="indigo" />
            <Typography type="body-sm" className="text-zinc-500 mt-4">
              {t("fetchingTitles")}
            </Typography>
          </View>
        ) : movies.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Typography type="h5" weight="bold">
              {t("noMoviesFound")}
            </Typography>
            <Typography
              type="body-sm"
              className="text-center text-zinc-500 mt-1"
            >
              {t("noMoviesSub")}
            </Typography>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between px-4 py-3">
            {movies.map((movie) => {
              const isFav = favorites.some((m) => m.id === movie.id);
              const isWatch = watchlist.some((m) => m.id === movie.id);
              return (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  isFav={isFav}
                  isWatch={isWatch}
                  onPress={() =>
                    router.push({
                      pathname: "/movie/[id]",
                      params: { id: movie.id },
                    })
                  }
                  onFavoritePress={() => toggleFavorite(movie)}
                  onWatchlistPress={() => toggleWatchlist(movie)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
