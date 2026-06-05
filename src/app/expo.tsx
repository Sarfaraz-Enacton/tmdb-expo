import { Button, Card, Typography } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Device from "expo-device";
import * as WebBrowser from "expo-web-browser";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

export default function ExpoScreen() {
  const { t } = useTranslation();
  const [statusBarStyle, setStatusBarStyle] = useState<"light" | "dark">("dark");

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <StatusBar style={statusBarStyle} />

      {/* Header Section */}
      <View className="px-5 pt-4 pb-3 flex-row justify-between items-center bg-white border-b border-zinc-100 shadow-sm">
        <Typography
          type="h3"
          weight="bold"
          className="text-indigo-600 text-2xl tracking-tight"
        >
          {t("expoFeatures")}
        </Typography>
      </View>

      <ScrollView className="flex-grow p-4 gap-4 pb-16">
        {/* Device Info */}
        <Card className="p-4 bg-white border border-zinc-100 rounded-3xl shadow-sm mb-4">
          <Typography type="h5" weight="bold" className="text-zinc-800 mb-3">
            {t("deviceInfo")}
          </Typography>
          <View className="gap-2">
            <View className="flex-row justify-between border-b border-zinc-100 pb-2">
              <Typography type="body-sm" className="text-zinc-500">
                {t("modelName")}
              </Typography>
              <Typography
                type="body-sm"
                weight="semibold"
                className="text-zinc-800"
              >
                {Device.modelName ?? "Unknown"}
              </Typography>
            </View>
            <View className="flex-row justify-between border-b border-zinc-100 pb-2">
              <Typography type="body-sm" className="text-zinc-500">
                Brand
              </Typography>
              <Typography
                type="body-sm"
                weight="semibold"
                className="text-zinc-800"
              >
                {Device.brand ?? "Unknown"}
              </Typography>
            </View>
            <View className="flex-row justify-between pb-2">
              <Typography type="body-sm" className="text-zinc-500">
                {t("osVersion")}
              </Typography>
              <Typography
                type="body-sm"
                weight="semibold"
                className="text-zinc-800"
              >
                {Device.osVersion ?? "Unknown"}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Constants Info */}
        <Card className="p-4 bg-white border border-zinc-100 rounded-3xl shadow-sm mb-4">
          <Typography type="h5" weight="bold" className="text-zinc-800 mb-3">
            App Config (Constants)
          </Typography>
          <View className="gap-2">
            <View className="flex-row justify-between border-b border-zinc-100 pb-2">
              <Typography type="body-sm" className="text-zinc-500">
                App Name
              </Typography>
              <Typography
                type="body-sm"
                weight="semibold"
                className="text-zinc-800"
              >
                {Constants.expoConfig?.name ?? "TMDB Expo"}
              </Typography>
            </View>
            <View className="flex-row justify-between pb-2">
              <Typography type="body-sm" className="text-zinc-500">
                Expo SDK Version
              </Typography>
              <Typography
                type="body-sm"
                weight="semibold"
                className="text-zinc-800"
              >
                v56.0.0
              </Typography>
            </View>
          </View>
        </Card>

        {/* Interactive Demos */}
        <Card className="p-4 bg-white border border-zinc-100 rounded-3xl shadow-sm mb-4">
          <Typography type="h5" weight="bold" className="text-zinc-800 mb-3">
            Interactive SDK Features
          </Typography>
          <View className="gap-4">
            {/* Status Bar Demo */}
            <View className="gap-2">
              <Typography
                type="body-xs"
                weight="medium"
                className="text-zinc-500 uppercase"
              >
                Status Bar Style
              </Typography>
              <Button
                variant="outline"
                onPress={() =>
                  setStatusBarStyle(
                    statusBarStyle === "light" ? "dark" : "light",
                  )
                }
              >
                Toggle Status Bar Style ({statusBarStyle})
              </Button>
            </View>

            {/* Web Browser Demo */}
            <View className="gap-2 mt-2">
              <Typography
                type="body-xs"
                weight="medium"
                className="text-zinc-500 uppercase"
              >
                WebBrowser API
              </Typography>
              <Button
                variant="primary"
                className="bg-indigo-600"
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    "https://docs.expo.dev/versions/v56.0.0/",
                  )
                }
              >
                {t("openBrowser")}
              </Button>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
