import { useQuery } from "@tanstack/react-query";
import { Button, Card, PressableFeedback, Typography } from "heroui-native";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Activity, LogOut, User } from "lucide-react-native";
import { validateApiKey } from "../services/tmdb";
import { useMovieStore } from "../stores/useMovieStore";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();

  // Zustand Auth State
  const sessionId = useMovieStore((state) => state.sessionId);
  const userAccount = useMovieStore((state) => state.userAccount);
  const logout = useMovieStore((state) => state.logout);

  // Query API key validation status
  const { data: isValidKey, isLoading: isValidatingKey } = useQuery({
    queryKey: ["apiKeyValidation"],
    queryFn: validateApiKey,
    staleTime: 60000, // cache validation for 1 minute
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
          {t("settings")}
        </Typography>
      </View>

      <ScrollView className="flex-grow p-4 gap-4 pb-16" contentContainerClassName="gap-4">
        {/* API Connection Status Card */}
        <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="p-2 rounded-xl bg-indigo-50">
              <Activity size={20} color="#4f46e5" />
            </View>
            <Typography type="h5" weight="bold" className="text-zinc-800">
              TMDB Connection
            </Typography>
          </View>

          <View className="flex-row items-center justify-between bg-zinc-50 border border-zinc-100 rounded-2xl p-4">
            <Typography type="body-sm" className="text-zinc-500">
              API Read Token Status
            </Typography>

            {isValidatingKey ? (
              <Typography type="body-xs" className="text-zinc-400">
                Verifying...
              </Typography>
            ) : isValidKey ? (
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <Typography type="body-xs" weight="bold" className="text-green-600">
                  Connected
                </Typography>
              </View>
            ) : (
              <View className="flex-row items-center gap-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <Typography type="body-xs" weight="bold" className="text-red-600">
                  Invalid Token
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* User Account / Session Status Card */}
        {sessionId && userAccount && (
          <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="p-2 rounded-xl bg-indigo-50">
                <User size={20} color="#4f46e5" />
              </View>
              <Typography type="h5" weight="bold" className="text-zinc-800">
                TMDB Account
              </Typography>
            </View>

            <View className="items-center bg-zinc-50 border border-zinc-100 rounded-2xl p-4 mb-4 gap-2">
              <Typography type="h5" weight="bold" className="text-zinc-800 text-center">
                {userAccount.name || userAccount.username}
              </Typography>
              <Typography type="body-xs" className="text-zinc-500 text-center">
                @{userAccount.username}
              </Typography>
              <Typography type="body-xs" className="text-zinc-400 text-center text-[10px]">
                ID: {userAccount.id} • Lang: {userAccount.iso_639_1.toUpperCase()}
              </Typography>
            </View>

            <PressableFeedback
              onPress={() => logout()}
              className="border border-red-200 bg-white rounded-2xl py-3 flex-row items-center justify-center gap-2 active:bg-red-50 shadow-sm"
            >
              <LogOut size={16} color="#ef4444" />
              <Typography weight="semibold" className="text-red-500 text-xs">
                {t("logout")}
              </Typography>
            </PressableFeedback>
          </Card>
        )}

        {/* Language Selector */}
        <Card className="p-5 bg-white border border-zinc-100 rounded-3xl shadow-sm">
          <Typography type="h5" weight="bold" className="text-zinc-800 mb-3">
            {t("language")}
          </Typography>
          <View className="flex-row gap-3">
            <Button
              variant={i18n.language.startsWith("en") ? "primary" : "outline"}
              className={
                i18n.language.startsWith("en")
                  ? "flex-1 bg-indigo-600 rounded-2xl py-3"
                  : "flex-1 rounded-2xl py-3"
              }
              onPress={() => i18n.changeLanguage("en")}
            >
              {t("english")}
            </Button>
            <Button
              variant={i18n.language.startsWith("es") ? "primary" : "outline"}
              className={
                i18n.language.startsWith("es")
                  ? "flex-1 bg-indigo-600 rounded-2xl py-3"
                  : "flex-1 rounded-2xl py-3"
              }
              onPress={() => i18n.changeLanguage("es")}
            >
              {t("spanish")}
            </Button>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
