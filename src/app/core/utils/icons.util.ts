import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  briefcaseOutline,
  cartOutline,
  fitnessOutline,
  heartOutline,
  homeOutline,
  schoolOutline,
  sparklesOutline,
} from 'ionicons/icons';

/**
 * Register every icon offered by `CATEGORY_ICONS` so category chips/tiles render
 * them reliably. Category icons are bound dynamically (`[name]="category.icon"`),
 * so without explicit registration Ionicons falls back to fetching the SVG by URL
 * — which only warns on a normal page but throws "Failed to construct 'URL'"
 * inside an `ion-modal` overlay and aborts the rest of the template.
 *
 * Call once from the constructor of any component that displays category icons.
 */
export function registerCategoryIcons(): void {
  addIcons({
    briefcaseOutline,
    homeOutline,
    heartOutline,
    schoolOutline,
    cartOutline,
    fitnessOutline,
    airplaneOutline,
    sparklesOutline,
  });
}
