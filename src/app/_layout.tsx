import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryProvider } from "../providers/QueryProvider";
import { AppLayout } from "../components/AppLayout";
import "../i18n/index";
import "./global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <HeroUINativeProvider>
          <AppLayout>
            <Stack>
              <Stack.Screen
                name="index"
                options={{ title: "Explore", headerShown: false }}
              />
              <Stack.Screen
                name="library"
                options={{ title: "Library", headerShown: false }}
              />
              <Stack.Screen
                name="expo"
                options={{ title: "Expo Features", headerShown: false }}
              />
              <Stack.Screen
                name="settings"
                options={{ title: "Settings", headerShown: false }}
              />
              <Stack.Screen
                name="movie/[id]"
                options={{ title: "Movie Details", headerShown: false }}
              />
            </Stack>
          </AppLayout>
        </HeroUINativeProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
