import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  barbellOutline,
  basketballOutline,
  bicycleOutline,
  bookOutline,
  briefcaseOutline,
  cafeOutline,
  cameraOutline,
  cartOutline,
  constructOutline,
  fitnessOutline,
  footballOutline,
  gameControllerOutline,
  heartOutline,
  homeOutline,
  laptopOutline,
  leafOutline,
  musicalNotesOutline,
  pawOutline,
  peopleOutline,
  restaurantOutline,
  schoolOutline,
  sparklesOutline,
  tennisballOutline,
  walkOutline,
  walletOutline,
} from 'ionicons/icons';

/**
 * Register every icon offered by `CATEGORY_ICONS` so category chips/tiles render
 * them reliably. Category icons are bound dynamically (`[name]="category.icon"`),
 * so without explicit registration Ionicons falls back to fetching the SVG by URL
 * — which only warns on a normal page but throws "Failed to construct 'URL'"
 * inside an `ion-modal` overlay and aborts the rest of the template.
 *
 * Keep this list in sync with `CATEGORY_ICONS` (core/constants/app.constants.ts).
 * Call once from the constructor of any component that displays category icons.
 */
export function registerCategoryIcons(): void {
  addIcons({
    // Work & study
    briefcaseOutline,
    schoolOutline,
    bookOutline,
    laptopOutline,
    // Home & errands
    homeOutline,
    cartOutline,
    constructOutline,
    walletOutline,
    // Health & exercise
    heartOutline,
    fitnessOutline,
    barbellOutline,
    walkOutline,
    bicycleOutline,
    // Sports
    basketballOutline,
    footballOutline,
    tennisballOutline,
    // Leisure & activities
    musicalNotesOutline,
    gameControllerOutline,
    restaurantOutline,
    cafeOutline,
    cameraOutline,
    pawOutline,
    peopleOutline,
    airplaneOutline,
    leafOutline,
    sparklesOutline,
  });
}
