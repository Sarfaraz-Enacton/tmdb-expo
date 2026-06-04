# Project Coding Guidelines for AI Agents

Please read and follow these rules strictly before writing or modifying any code in this repository.

## 1. Expo SDK Compliance
* **Expo SDK Version:** This project runs on Expo SDK 56.
* **Documentation Rule:** You must read the exact versioned documentation at **https://docs.expo.dev/versions/v56.0.0/** before writing or editing any code.

## 2. Styling Constraints (Uniwind / Tailwind CSS v4)
* **Only use Uniwind (Tailwind CSS v4) classes** via the `className` prop for styling.
* **Do NOT use custom `StyleSheet.create` or inline `style={{ ... }}` objects** anywhere in the project.
* No custom styles or `<style>` tags are allowed.

## 3. Component Constraints (HeroUI Native)
* **Only use components from the `heroui-native` package** for all UI elements (like `Button`, `Text`, `Input`, `Card`, `Tabs`, `Chip`, `Dialog`, etc.).
* **Do NOT import UI components from React Native or Expo** (like core `TouchableOpacity`, `Button`, `Text`, `TextInput`, etc.).
* **Exception for Layout Structures:** You may use core structural containers from React Native or related libraries (like `View`, `ScrollView`, `SafeAreaView`, `GestureHandlerRootView`) for layout nesting and scaffolding, provided they are styled exclusively using Uniwind class names.

## 4. Data Fetching & API Constraints
* **Consuming External TMDB API:** This project is for TMDB API integration.
* **No Server-Side API Creation:** Do not build any server-side APIs or routing handlers. Only consume the external TMDB API endpoints.

<!-- HEROUI-NATIVE-AGENTS-MD-START -->
[HeroUI Native Docs Index]|root: ./.heroui-docs/native|STOP. What you remember about HeroUI Native is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --native --output AGENTS.md
<!-- HEROUI-NATIVE-AGENTS-MD-END -->
