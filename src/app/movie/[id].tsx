import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Card,
  Chip,
  PressableFeedback,
  Spinner,
  Typography,
} from "heroui-native";
import { ArrowLeft, Bookmark, Heart, Globe, Film } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { getImageUrl, getMovieDetails } from "../../services/tmdb";
import { useMovieStore } from "../../stores/useMovieStore";

const Image = withUniwind(ExpoImage);

const formatRuntime = (minutes: number | null): string => {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const formatCurrency = (amount: number | null): string => {
  if (!amount || amount === 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();

  const movieId = parseInt(id || "", 10);

  // Zustand favorite/watchlist functions
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !isNaN(movieId),
  });

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-20 bg-zinc-50">
        <Spinner size="lg" color="indigo" />
        <Typography type="body-sm" className="text-zinc-500 mt-4">
          {t("fetchingTitles")}
        </Typography>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView
        className="flex-1 bg-zinc-50 justify-center items-center px-6"
        edges={["top", "bottom"]}
      >
        <Typography type="h4" weight="bold" className="text-red-500">
          {t("noMoviesFound")}
        </Typography>
        <PressableFeedback
          onPress={() => router.back()}
          className="mt-6 bg-indigo-600 active:bg-indigo-700 px-6 py-3 rounded-xl shadow-md"
        >
          <Typography className="text-white text-sm font-semibold">
            {t("back")}
          </Typography>
        </PressableFeedback>
      </SafeAreaView>
    );
  }

  const isFav = favorites.some((m) => m.id === movie.id);
  const isWatch = watchlist.some((m) => m.id === movie.id);

  return (
    <View className="flex-1 bg-zinc-50">
      <ScrollView className="flex-1" contentContainerClassName="pb-10">
        {/* Backdrop Image Section */}
        <View className="relative w-full h-72">
          <Image
            source={{ uri: getImageUrl(movie.backdrop_path) }}
            className="w-full h-full"
            contentFit="cover"
            transition={300}
          />
          {/* Subtle gradient overlay to read the text better */}
          <View className="absolute inset-0 bg-black/40" />

          {/* Header Navigation overlay */}
          <View
            className="absolute top-12 left-0 right-0 px-4 flex-row justify-between items-center z-10"
          >
            <PressableFeedback
              onPress={() => router.back()}
              className="p-2.5 rounded-full bg-black/45 active:bg-black/60 items-center justify-center shadow-sm"
            >
              <ArrowLeft size={20} color="#ffffff" />
            </PressableFeedback>
            <View />
          </View>

          {/* Overlapping Quick Info (Title and Year over Backdrop) */}
          <View className="absolute bottom-4 left-4 right-4 flex-row items-end gap-4">
            <Image
              source={{ uri: getImageUrl(movie.poster_path) }}
              className="w-24 h-36 rounded-xl border-2 border-white shadow-md bg-zinc-200"
              contentFit="cover"
            />
            <View className="flex-1 pb-1">
              <Typography
                type="h4"
                weight="bold"
                className="text-white mb-1 leading-tight"
                truncate
              >
                {movie.title}
              </Typography>
              <View className="flex-row items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  color="warning"
                  className="px-1.5 py-0.5 rounded-md"
                >
                  <Chip.Label className="text-warning-800 font-bold text-[10px]">
                    ★ {movie.vote_average.toFixed(1)}
                  </Chip.Label>
                </Chip>
                <Typography type="body-xs" className="text-zinc-300">
                  {movie.release_date
                    ? movie.release_date.split("-")[0]
                    : "N/A"}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-5 pt-6 gap-6">
          {/* Tagline */}
          {movie.tagline ? (
            <Typography
              type="body-sm"
              weight="semibold"
              className="text-indigo-600/80 italic text-center px-4 my-1"
            >
              {`"${movie.tagline}"`}
            </Typography>
          ) : null}

          {/* Genres Section */}
          {movie.genres && movie.genres.length > 0 && (
            <View className="flex-row flex-wrap gap-2 justify-center">
              {movie.genres.map((genre) => (
                <Chip
                  key={genre.id}
                  size="sm"
                  className="border border-indigo-100 bg-indigo-50/50 px-2.5 py-0.5 rounded-full"
                >
                  <Chip.Label className="text-indigo-700 font-medium text-[11px]">
                    {genre.name}
                  </Chip.Label>
                </Chip>
              ))}
            </View>
          )}

          {/* Action Buttons (Favorite and Watchlist) */}
          <View className="flex-row gap-4">
            <PressableFeedback
              onPress={() => toggleFavorite(movie)}
              className={
                isFav
                  ? "flex-1 bg-red-500 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-red-600"
                  : "flex-1 bg-white border border-zinc-200 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-zinc-50"
              }
            >
              <Heart
                size={18}
                color={isFav ? "#ffffff" : "#ef4444"}
                fill={isFav ? "#ffffff" : "transparent"}
              />
              <Typography
                weight="semibold"
                className={
                  isFav ? "text-white text-xs" : "text-zinc-700 text-xs"
                }
              >
                {isFav ? t("removeFromFavorites") : t("addToFavorites")}
              </Typography>
            </PressableFeedback>

            <PressableFeedback
              onPress={() => toggleWatchlist(movie)}
              className={
                isWatch
                  ? "flex-1 bg-indigo-600 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-indigo-700"
                  : "flex-1 bg-white border border-zinc-200 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-zinc-50"
              }
            >
              <Bookmark
                size={18}
                color={isWatch ? "#ffffff" : "#4f46e5"}
                fill={isWatch ? "#ffffff" : "transparent"}
              />
              <Typography
                weight="semibold"
                className={
                  isWatch ? "text-white text-xs" : "text-zinc-700 text-xs"
                }
              >
                {isWatch ? t("removeFromWatchlist") : t("addToWatchlist")}
              </Typography>
            </PressableFeedback>
          </View>

          {/* Movie Statistics Grid */}
          <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <Typography type="h5" weight="bold" className="text-zinc-800 mb-4">
              {t("movieInfo")}
            </Typography>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {/* Runtime */}
              <View className="w-[47%]">
                <Typography
                  type="body-xs"
                  weight="medium"
                  className="text-zinc-400 uppercase tracking-wider text-[10px]"
                >
                  {t("runtimeLabel")}
                </Typography>
                <Typography
                  type="body-sm"
                  weight="semibold"
                  className="text-zinc-700 mt-1"
                >
                  {formatRuntime(movie.runtime)}
                </Typography>
              </View>
              {/* Status */}
              <View className="w-[47%]">
                <Typography
                  type="body-xs"
                  weight="medium"
                  className="text-zinc-400 uppercase tracking-wider text-[10px]"
                >
                  {t("statusLabel")}
                </Typography>
                <Typography
                  type="body-sm"
                  weight="semibold"
                  className="text-zinc-700 mt-1"
                >
                  {movie.status || "N/A"}
                </Typography>
              </View>
              {/* Budget */}
              <View className="w-[47%]">
                <Typography
                  type="body-xs"
                  weight="medium"
                  className="text-zinc-400 uppercase tracking-wider text-[10px]"
                >
                  {t("budgetLabel")}
                </Typography>
                <Typography
                  type="body-sm"
                  weight="semibold"
                  className="text-zinc-700 mt-1"
                >
                  {formatCurrency(movie.budget)}
                </Typography>
              </View>
              {/* Revenue */}
              <View className="w-[47%]">
                <Typography
                  type="body-xs"
                  weight="medium"
                  className="text-zinc-400 uppercase tracking-wider text-[10px]"
                >
                  {t("revenueLabel")}
                </Typography>
                <Typography
                  type="body-sm"
                  weight="semibold"
                  className="text-zinc-700 mt-1"
                >
                  {formatCurrency(movie.revenue)}
                </Typography>
              </View>
            </View>
          </Card>

          {/* Overview Section */}
          <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <Typography type="h5" weight="bold" className="text-zinc-800 mb-3">
              {t("overview")}
            </Typography>
            <Typography
              type="body-sm"
              className="text-zinc-600 leading-relaxed"
            >
              {movie.overview || "No overview available for this movie."}
            </Typography>
          </Card>

          {/* Production Companies Section */}
          {movie.production_companies && movie.production_companies.length > 0 && (
            <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm gap-4">
              <Typography type="h5" weight="bold" className="text-zinc-800">
                {t("productionCompanies")}
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="gap-4 py-1"
              >
                {movie.production_companies.map((company) => (
                  <View
                    key={company.id}
                    className="items-center bg-zinc-50 border border-zinc-100/50 rounded-2xl p-3 w-32 justify-center"
                  >
                    {company.logo_path ? (
                      <Image
                        source={{ uri: getImageUrl(company.logo_path) }}
                        className="w-12 h-12 mb-2"
                        contentFit="contain"
                      />
                    ) : (
                      <View className="w-12 h-12 bg-indigo-50 items-center justify-center rounded-xl mb-2">
                        <Film size={20} color="#4f46e5" />
                      </View>
                    )}
                    <Typography
                      type="body-xs"
                      weight="semibold"
                      className="text-zinc-700 text-center"
                      truncate
                    >
                      {company.name}
                    </Typography>
                    <Typography
                      type="body-xs"
                      className="text-zinc-400 text-[9px] mt-0.5 uppercase"
                    >
                      {company.origin_country || "N/A"}
                    </Typography>
                  </View>
                ))}
              </ScrollView>
            </Card>
          )}

          {/* External Links Section */}
          {(movie.homepage || movie.imdb_id) && (
            <View className="flex-row gap-4 mt-2">
              {movie.homepage && (
                <PressableFeedback
                  onPress={() => WebBrowser.openBrowserAsync(movie.homepage!)}
                  className="flex-1 bg-white border border-zinc-200 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-zinc-50"
                >
                  <Globe size={16} color="#4f46e5" />
                  <Typography
                    weight="semibold"
                    className="text-indigo-600 text-xs"
                  >
                    {t("visitHomepage")}
                  </Typography>
                </PressableFeedback>
              )}
              {movie.imdb_id && (
                <PressableFeedback
                  onPress={() =>
                    WebBrowser.openBrowserAsync(
                      `https://www.imdb.com/title/${movie.imdb_id}`,
                    )
                  }
                  className="flex-1 bg-zinc-900 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:bg-zinc-950"
                >
                  <Typography weight="semibold" className="text-white text-xs">
                    {t("viewImdb")}
                  </Typography>
                </PressableFeedback>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
