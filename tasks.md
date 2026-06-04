# TMDB Integration Tasks

## Phase 1: Configuration & Setup
- [ ] Configure TMDB API keys/endpoints securely.
- [ ] Create a reusable fetching utility (`src/services/tmdb.ts`) for querying TMDB endpoints (Trending, Popular, Search).

## Phase 2: Home Screen UI (`src/app/index.tsx`)
- [ ] Implement search bar using HeroUI Native `<Input>` or `<SearchField>`.
- [ ] Add movie category filtering using HeroUI Native `<Tabs>`.
- [ ] Render a grid or list of movies using `<Card>` and `<Text>` components from `heroui-native`.
- [ ] Ensure all layout boxes are styled with Uniwind classes (no stylesheet/style props).

## Phase 3: Movie Detail View
- [ ] Add a detail popup/modal or subview to display movie poster, overview description, rating, and release date when a movie card is tapped.
- [ ] Use `<Modal>` or `<Dialog>` from `heroui-native` to ensure strict compliance with component rules.
