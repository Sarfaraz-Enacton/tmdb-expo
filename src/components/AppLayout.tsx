import React, { ReactNode, useEffect } from "react";
import { View } from "react-native";
import { PressableFeedback, Typography } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Cpu, Film, Library, Settings } from "lucide-react-native";
import { usePathname, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useMovieStore } from "../stores/useMovieStore";
import { getFavoriteMovies, getWatchlistMovies } from "../services/tmdb";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const showBottomBar = !pathname.startsWith("/movie");

  // Zustand state
  const sessionId = useMovieStore((state) => state.sessionId);
  const userAccount = useMovieStore((state) => state.userAccount);

  // Global TanStack Query to fetch favorites when logged in
  const { data: onlineFavorites } = useQuery({
    queryKey: ["onlineFavorites", userAccount?.id, sessionId],
    queryFn: () => getFavoriteMovies(userAccount!.id, sessionId!),
    enabled: !!(sessionId && userAccount),
  });

  // Global TanStack Query to fetch watchlist when logged in
  const { data: onlineWatchlist } = useQuery({
    queryKey: ["onlineWatchlist", userAccount?.id, sessionId],
    queryFn: () => getWatchlistMovies(userAccount!.id, sessionId!),
    enabled: !!(sessionId && userAccount),
  });

  // Sync with Zustand store
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

  return (
    <View className="flex-1 bg-zinc-50">
      <View className="flex-1">
        {children}
      </View>

      {/* Global Bottom Navigation Bar */}
      {showBottomBar && (
        <View className="flex-row border-t border-zinc-200/50 bg-white/95 px-2 py-2 justify-around items-center">
          <PressableFeedback
            onPress={() => router.replace("/")}
            className="items-center py-1.5 flex-1 gap-1"
          >
            <Film
              size={20}
              color={pathname === "/" ? "#4f46e5" : "#9ca3af"}
            />
            <Typography
              type="body-xs"
              weight={pathname === "/" ? "bold" : "regular"}
              className={pathname === "/" ? "text-indigo-600 text-[10px]" : "text-zinc-400 text-[10px]"}
            >
              {t("explore")}
            </Typography>
          </PressableFeedback>

          <PressableFeedback
            onPress={() => router.replace("/library")}
            className="items-center py-1.5 flex-1 gap-1"
          >
            <Library
              size={20}
              color={pathname === "/library" ? "#4f46e5" : "#9ca3af"}
            />
            <Typography
              type="body-xs"
              weight={pathname === "/library" ? "bold" : "regular"}
              className={pathname === "/library" ? "text-indigo-600 text-[10px]" : "text-zinc-400 text-[10px]"}
            >
              {t("library")}
            </Typography>
          </PressableFeedback>

          <PressableFeedback
            onPress={() => router.replace("/expo")}
            className="items-center py-1.5 flex-1 gap-1"
          >
            <Cpu
              size={20}
              color={pathname === "/expo" ? "#4f46e5" : "#9ca3af"}
            />
            <Typography
              type="body-xs"
              weight={pathname === "/expo" ? "bold" : "regular"}
              className={pathname === "/expo" ? "text-indigo-600 text-[10px]" : "text-zinc-400 text-[10px]"}
            >
              {t("expoFeatures")}
            </Typography>
          </PressableFeedback>

          <PressableFeedback
            onPress={() => router.replace("/settings")}
            className="items-center py-1.5 flex-1 gap-1"
          >
            <Settings
              size={20}
              color={pathname === "/settings" ? "#4f46e5" : "#9ca3af"}
            />
            <Typography
              type="body-xs"
              weight={pathname === "/settings" ? "bold" : "regular"}
              className={pathname === "/settings" ? "text-indigo-600 text-[10px]" : "text-zinc-400 text-[10px]"}
            >
              {t("settings")}
            </Typography>
          </PressableFeedback>
        </View>
      )}
    </View>
  );
}
