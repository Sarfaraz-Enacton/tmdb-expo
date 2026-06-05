import { useQuery } from "@tanstack/react-query";
import { Image as ExpoImage } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  Button,
  Card,
  PressableFeedback,
  Spinner,
  Tabs,
  Typography,
} from "heroui-native";
import { Bookmark, Cloud, Heart, LogOut, User } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

import { MovieCard } from "../components/MovieCard";
import {
  createRequestToken,
  createSession,
  getAccountDetails,
  getFavoriteMovies,
  getImageUrl,
  getWatchlistMovies,
} from "../services/tmdb";
import { useMovieStore } from "../stores/useMovieStore";

const Image = withUniwind(ExpoImage);

export default function Library() {
  const { t } = useTranslation();
  const [libraryTab, setLibraryTab] = useState<string>("favorites");

  // Zustand state
  const sessionId = useMovieStore((state) => state.sessionId);
  const userAccount = useMovieStore((state) => state.userAccount);
  const logout = useMovieStore((state) => state.logout);
  const favorites = useMovieStore((state) => state.favorites);
  const watchlist = useMovieStore((state) => state.watchlist);
  const toggleFavorite = useMovieStore((state) => state.toggleFavorite);
  const toggleWatchlist = useMovieStore((state) => state.toggleWatchlist);

  // Local state for auth flow
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasOpenedBrowser, setHasOpenedBrowser] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // TanStack Query for online lists
  const {
    data: onlineFavorites,
    isLoading: isLoadingFavorites,
    refetch: refetchFavs,
  } = useQuery({
    queryKey: ["onlineFavorites", userAccount?.id, sessionId],
    queryFn: () => getFavoriteMovies(userAccount!.id, sessionId!),
    enabled: !!(sessionId && userAccount),
  });

  const {
    data: onlineWatchlist,
    isLoading: isLoadingWatchlist,
    refetch: refetchWatch,
  } = useQuery({
    queryKey: ["onlineWatchlist", userAccount?.id, sessionId],
    queryFn: () => getWatchlistMovies(userAccount!.id, sessionId!),
    enabled: !!(sessionId && userAccount),
  });

  // Keep Zustand store lists in sync with TMDB cloud data
  useEffect(() => {
    if (onlineFavorites) {
      useMovieStore.setState({ favorites: onlineFavorites });
    }
  }, [onlineFavorites]);

  useEffect(() => {
    if (onlineWatchlist) {
      useMovieStore.setState({ watchlist: onlineWatchlist });
    }
  }, [onlineWatchlist]);

  // Refetch lists on screen focus to keep them in sync if toggled elsewhere
  useFocusEffect(
    useCallback(() => {
      if (sessionId && userAccount) {
        refetchFavs();
        refetchWatch();
      }
    }, [sessionId, userAccount, refetchFavs, refetchWatch]),
  );

  const getAvatarUrl = () => {
    if (!userAccount) return null;
    const { avatar } = userAccount;
    if (avatar?.tmdb?.avatar_path) {
      return getImageUrl(avatar.tmdb.avatar_path);
    }
    if (avatar?.gravatar?.hash) {
      return `https://www.gravatar.com/avatar/${avatar.gravatar.hash}?s=150`;
    }
    return null;
  };

  const handleConnect = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const token = await createRequestToken();
      if (!token) {
        setErrorMsg("Failed to generate request token. Check your network.");
        setIsLoggingIn(false);
        return;
      }
      useMovieStore.setState({ requestToken: token });
      setHasOpenedBrowser(true);

      const authUrl = `https://www.themoviedb.org/authenticate/${token}`;
      await WebBrowser.openBrowserAsync(authUrl);

      // Browser closed, trigger exchange automatically
      await handleCompleteLogin(token);
    } catch (err) {
      console.error(err);
      setErrorMsg("An error occurred during authentication.");
      setIsLoggingIn(false);
    }
  };

  const handleCompleteLogin = async (tokenOverride?: string) => {
    const token = tokenOverride || useMovieStore.getState().requestToken;
    if (!token) {
      setErrorMsg("No active authentication token found.");
      return;
    }
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const sessId = await createSession(token);
      if (!sessId) {
        setErrorMsg(
          "Could not create session. Authorize the request in browser first.",
        );
        setIsLoggingIn(false);
        return;
      }
      const account = await getAccountDetails(sessId);
      if (!account) {
        setErrorMsg("Failed to fetch TMDB account details.");
        setIsLoggingIn(false);
        return;
      }
      useMovieStore.setState({
        sessionId: sessId,
        userAccount: account,
        requestToken: null,
      });
      setHasOpenedBrowser(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to finalize login.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const showSpinner =
    sessionId &&
    ((libraryTab === "favorites" &&
      isLoadingFavorites &&
      favorites.length === 0) ||
      (libraryTab === "watchlist" &&
        isLoadingWatchlist &&
        watchlist.length === 0));

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {/* Header Section */}
      <View className="px-5 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-zinc-100 shadow-sm">
        <Typography
          type="h3"
          weight="bold"
          className="text-indigo-600 text-2xl tracking-tight"
        >
          {t("library")}
        </Typography>
      </View>

      {/* Library Connection Status Bar/Card */}
      {!sessionId ? (
        <Card className="m-4 p-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl shadow-md border-0">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="p-2 rounded-xl bg-white/20">
              <Cloud size={24} color="#ffffff" />
            </View>
            <Typography type="h4" weight="bold" className="text-white">
              {t("syncWithTmdb")}
            </Typography>
          </View>
          <Typography
            type="body-sm"
            className="text-indigo-100 mb-4 leading-relaxed"
          >
            {t("syncDescription")}
          </Typography>
          {errorMsg && (
            <View className="mb-4 p-3 bg-red-500/20 rounded-xl border border-red-500/30">
              <Typography type="body-xs" className="text-red-100">
                {errorMsg}
              </Typography>
            </View>
          )}
          <View className="flex-row gap-3">
            {isLoggingIn ? (
              <View className="flex-1 bg-white/25 py-3 rounded-2xl flex-row items-center justify-center gap-2">
                <Spinner size="sm" color="white" />
                <Typography weight="semibold" className="text-white text-xs">
                  {t("authorizing")}
                </Typography>
              </View>
            ) : hasOpenedBrowser ? (
              <>
                <Button
                  variant="secondary"
                  className="flex-1 bg-white/20 rounded-2xl py-3 border-0 active:bg-white/30"
                  onPress={handleConnect}
                >
                  Retry Link
                </Button>
                <Button
                  variant="primary"
                  className="flex-1 bg-white rounded-2xl py-3 border-0 active:bg-zinc-100 text-indigo-600 font-semibold"
                  onPress={() => handleCompleteLogin()}
                >
                  {t("completeConnection")}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full bg-white rounded-2xl py-3 border-0 active:bg-zinc-100 text-indigo-600 font-semibold"
                onPress={handleConnect}
              >
                {t("connectTmdb")}
              </Button>
            )}
          </View>
        </Card>
      ) : (
        <Card className="m-4 p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              {getAvatarUrl() ? (
                <Image
                  source={{ uri: getAvatarUrl()! }}
                  className="w-14 h-14 rounded-full bg-zinc-100 border border-zinc-200"
                  contentFit="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-full bg-indigo-50 items-center justify-center border border-indigo-100">
                  <User size={24} color="#4f46e5" />
                </View>
              )}
              <View className="flex-1">
                <Typography
                  type="h5"
                  weight="bold"
                  className="text-zinc-800 leading-tight"
                >
                  {userAccount?.name || userAccount?.username}
                </Typography>
                <Typography type="body-xs" className="text-zinc-500 mt-0.5">
                  @{userAccount?.username}
                </Typography>
                <View className="flex-row items-center gap-1.5 mt-2">
                  <View className="w-2 h-2 rounded-full bg-green-500" />
                  <Typography
                    type="body-xs"
                    weight="semibold"
                    className="text-green-600 uppercase text-[9px] tracking-wider"
                  >
                    TMDB Synced
                  </Typography>
                </View>
              </View>
            </View>

            <PressableFeedback
              onPress={() => logout()}
              className="p-3 rounded-2xl bg-red-50 border border-red-100 active:bg-red-100 shadow-sm"
            >
              <LogOut size={16} color="#ef4444" />
            </PressableFeedback>
          </View>
        </Card>
      )}

      {/* Library Navigation */}
      <View className="px-4 py-3 items-center bg-white border-b border-zinc-100 shadow-sm">
        <Tabs value={libraryTab} onValueChange={setLibraryTab}>
          <Tabs.List className="text-sm">
            <Tabs.Indicator />
            <Tabs.Trigger value="favorites">
              <Tabs.Label>{t("favorites")}</Tabs.Label>
            </Tabs.Trigger>
            <Tabs.Trigger value="watchlist">
              <Tabs.Label>{t("watchlist")}</Tabs.Label>
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </View>

      {/* Library Contents */}
      <ScrollView
        className="flex-grow pb-8"
        contentContainerClassName="flex-grow pb-40"
      >
        {showSpinner ? (
          <View className="flex-grow items-center justify-center py-24">
            <Spinner size="lg" color="indigo" />
            <Typography type="body-sm" className="text-zinc-500 mt-4">
              Synchronizing with TMDB...
            </Typography>
          </View>
        ) : libraryTab === "favorites" ? (
          favorites.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20 px-8">
              <Heart size={48} color="#cbd5e1" />
              <Typography
                type="h5"
                weight="bold"
                className="text-zinc-700 mt-4"
              >
                {t("favoritesEmpty")}
              </Typography>
              <Typography
                type="body-sm"
                className="text-center text-zinc-500 mt-1"
              >
                {t("addSomeMovies")}
              </Typography>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between px-4 py-3">
              {favorites.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPress={() =>
                    router.push({
                      pathname: "/movie/[id]",
                      params: { id: movie.id },
                    })
                  }
                  showDeleteButton={true}
                  onDeletePress={async () => {
                    await toggleFavorite(movie);
                    if (sessionId) refetchFavs();
                  }}
                />
              ))}
            </View>
          )
        ) : watchlist.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Bookmark size={48} color="#cbd5e1" />
            <Typography type="h5" weight="bold" className="text-zinc-700 mt-4">
              {t("watchlistEmpty")}
            </Typography>
            <Typography
              type="body-sm"
              className="text-center text-zinc-500 mt-1"
            >
              {t("addSomeMovies")}
            </Typography>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between px-4 py-3">
            {watchlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPress={() =>
                  router.push({
                    pathname: "/movie/[id]",
                    params: { id: movie.id },
                  })
                }
                showDeleteButton={true}
                onDeletePress={async () => {
                  await toggleWatchlist(movie);
                  if (sessionId) refetchWatch();
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
