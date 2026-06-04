import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./global.css";

export default function RootLayout() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <Stack>
            <Stack.Screen
              name="index"
              options={{ title: "Home", headerShown: false }}
            />
            <Stack.Screen
              name="about"
              options={{ title: "About", headerShown: false }}
            />
          </Stack>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </>
  );
}
