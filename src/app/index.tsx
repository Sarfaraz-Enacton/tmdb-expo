import { Image } from "expo-image";
import {
  Card,
  Chip,
  Dialog,
  Input,
  Spinner,
  Tabs,
  Typography,
} from "heroui-native";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getImageUrl,
  getPopularMovies,
  getTopRatedMovies,
  getTrendingMovies,
  Movie,
  searchMovies,
} from "../services/tmdb";

export default function Index() {
  const [activeTab, setActiveTab] = useState<string>("trending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Debounced search / tab load effect
  useEffect(() => {
    let active = true;

    if (searchQuery.trim()) {
      const delayDebounceFn = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchMovies(searchQuery);
          if (active) {
            setMovies(results);
          }
        } catch (error) {
          console.error("Error searching movies:", error);
        } finally {
          if (active) setLoading(false);
        }
      }, 400);

      return () => {
        active = false;
        clearTimeout(delayDebounceFn);
      };
    } else {
      const loadMovies = async () => {
        setLoading(true);
        try {
          let results: Movie[] = [];
          if (activeTab === "trending") {
            results = await getTrendingMovies();
          } else if (activeTab === "popular") {
            results = await getPopularMovies();
          } else if (activeTab === "top_rated") {
            results = await getTopRatedMovies();
          }
          if (active) {
            setMovies(results);
          }
        } catch (error) {
          console.error("Error loading tab movies:", error);
        } finally {
          if (active) setLoading(false);
        }
      };

      loadMovies();

      return () => {
        active = false;
      };
    }
  }, [searchQuery, activeTab]);

  return (
    <SafeAreaView className="flex-1">
      {/* Header Section */}
      <View className="px-5 pt-4 pb-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <Typography
            type="h3"
            weight="bold"
            className="text-gray-800 text-2xl tracking-wide"
          >
            CineExplore
          </Typography>
        </View>
      </View>

      {/* Search Bar Input */}
      <View className="px-4 py-2">
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search movies..."
        />
      </View>

      {/* Categories Tabs Filter */}
      {!searchQuery && (
        <View className="px-4 py-2 items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="text-sm">
              <Tabs.Indicator />
              <Tabs.Trigger value="trending">
                <Tabs.Label>Trending</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="popular">
                <Tabs.Label>Popular</Tabs.Label>
              </Tabs.Trigger>
              <Tabs.Trigger value="top_rated">
                <Tabs.Label>Top Rated</Tabs.Label>
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
        </View>
      )}

      {/* Movie Content Area */}
      <ScrollView contentContainerClassName="flex-grow pb-8">
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Spinner size="lg" color="indigo" />
            <Typography type="body-sm" className="text-zinc-500 mt-4">
              Fetching titles...
            </Typography>
          </View>
        ) : movies.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <Typography type="h5" weight="bold">
              No Movies Found
            </Typography>
            <Typography type="body-sm" className="text-center">
              Try searching for something else or check your network.
            </Typography>
          </View>
        ) : (
          // <View className="flex-row flex-wrap justify-between px-4 pt-4">
          <View className="grid grid-cols-2 gap-4 px-4 py-2">
            {movies.map((movie) => (
              <Card
                key={movie.id}
                className="p-0 bg-zinc-100 border border-zinc-800/80 rounded-2xl overflow-hidden"
                onPress={() => setSelectedMovie(movie)}
              >
                <Image
                  source={{ uri: getImageUrl(movie.poster_path) }}
                  className="w-full h-64 rounded-t-2xl"
                  contentFit="cover"
                  transition={250}
                />
                <View className="p-3">
                  <Typography type="body-xs" weight="semibold" truncate>
                    {movie.title}
                  </Typography>
                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                    <Typography
                      type="body-xs"
                      className="text-zinc-500 text-xs"
                    >
                      {movie.release_date
                        ? movie.release_date.split("-")[0]
                        : "N/A"}
                    </Typography>
                    <Chip
                      size="sm"
                      color="warning"
                      className="px-1.5 py-0.5 rounded-md"
                    >
                      <Chip.Label className="text-warning-800 font-bold text-[10px]">
                        ★ {movie.vote_average.toFixed(1)}
                      </Chip.Label>
                    </Chip>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Movie Details Dialog popup */}
      <Dialog
        isOpen={selectedMovie !== null}
        onOpenChange={(open) => !open && setSelectedMovie(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="bg-black/80 absolute inset-0" />
          <Dialog.Content className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 m-4 max-w-sm w-[90%] self-center shadow-2xl">
            {selectedMovie && (
              <View className="gap-4">
                <Image
                  source={{ uri: getImageUrl(selectedMovie.backdrop_path) }}
                  className="w-full h-44 rounded-2xl"
                  contentFit="cover"
                  transition={250}
                />

                <View>
                  <Dialog.Title className="text-white text-xl font-bold tracking-tight mb-1">
                    {selectedMovie.title}
                  </Dialog.Title>
                  <View className="flex-row items-center gap-2 mb-2">
                    <Typography type="body-xs" className="text-zinc-500">
                      Release: {selectedMovie.release_date}
                    </Typography>
                    <Typography type="body-xs" className="text-zinc-500">
                      •
                    </Typography>
                    <Chip
                      size="sm"
                      color="warning"
                      className="px-2 py-0.5 rounded-md"
                    >
                      <Chip.Label className="text-warning-800 font-bold text-[10px]">
                        ★ {selectedMovie.vote_average.toFixed(1)}
                      </Chip.Label>
                    </Chip>
                  </View>
                </View>

                <Dialog.Description className="text-zinc-400 text-sm leading-relaxed max-h-48">
                  {selectedMovie.overview}
                </Dialog.Description>

                <View className="pt-3 border-t border-zinc-800">
                  <Dialog.Close className="w-full bg-zinc-800 active:bg-zinc-700 py-3 rounded-xl items-center justify-center">
                    <Typography className="text-white text-sm font-semibold">
                      Close
                    </Typography>
                  </Dialog.Close>
                </View>
              </View>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </SafeAreaView>
  );
}
