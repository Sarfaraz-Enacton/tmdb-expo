import { Image as ExpoImage } from "expo-image";
import { Card, Chip, PressableFeedback, Typography } from "heroui-native";
import { Bookmark, Heart, Trash2 } from "lucide-react-native";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import { getImageUrl, Movie } from "../services/tmdb";

const Image = withUniwind(ExpoImage);

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  isFav?: boolean;
  isWatch?: boolean;
  onFavoritePress?: () => void;
  onWatchlistPress?: () => void;
  showDeleteButton?: boolean;
  onDeletePress?: () => void;
  showMeta?: boolean;
}

export function MovieCard({
  movie,
  onPress,
  isFav = false,
  isWatch = false,
  onFavoritePress,
  onWatchlistPress,
  showDeleteButton = false,
  onDeletePress,
  showMeta = true,
}: MovieCardProps) {
  return (
    <PressableFeedback className="w-[48%] mb-4 relative" onPress={onPress}>
      <Card className="w-full p-0 rounded-2xl bg-white border border-zinc-200 shadow-sm overflow-hidden">
        <View className="relative">
          <Image
            source={{ uri: getImageUrl(movie.poster_path) }}
            className="w-full h-60 rounded-t-2xl"
            contentFit="cover"
            transition={250}
          />

          {showDeleteButton ? (
            <PressableFeedback
              onPress={(e) => {
                e.stopPropagation();
                if (onDeletePress) onDeletePress();
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-500 active:bg-red-600 shadow-sm z-10"
            >
              <Trash2 size={16} color="#ffffff" />
            </PressableFeedback>
          ) : (
            <>
              {/* Favorite overlay button */}
              {onFavoritePress && (
                <PressableFeedback
                  onPress={(e) => {
                    e.stopPropagation();
                    onFavoritePress();
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-md"
                >
                  <Heart
                    size={18}
                    color={isFav ? "#ef4444" : "#ffffff"}
                    fill={isFav ? "#ef4444" : "transparent"}
                  />
                </PressableFeedback>
              )}

              {/* Watchlist overlay button */}
              {onWatchlistPress && (
                <PressableFeedback
                  onPress={(e) => {
                    e.stopPropagation();
                    onWatchlistPress();
                  }}
                  className="absolute top-2 left-2 p-2 rounded-full bg-black/40 backdrop-blur-md"
                >
                  <Bookmark
                    size={18}
                    color={isWatch ? "#3b82f6" : "#ffffff"}
                    fill={isWatch ? "#3b82f6" : "transparent"}
                  />
                </PressableFeedback>
              )}
            </>
          )}
        </View>

        <View className="p-3">
          <Typography type="body-xs" weight="semibold" truncate>
            {movie.title}
          </Typography>

          {showMeta && (
            <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-zinc-100">
              <Typography type="body-xs" className="text-zinc-500 text-xs">
                {movie.release_date ? movie.release_date.split("-")[0] : "N/A"}
              </Typography>
              <Chip
                size="sm"
                color="warning"
                className="px-1.5 py-0.5 rounded-md"
              >
                <Chip.Label className="text-warning-800 font-bold text-[10px]">
                  ★ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                </Chip.Label>
              </Chip>
            </View>
          )}
        </View>
      </Card>
    </PressableFeedback>
  );
}
