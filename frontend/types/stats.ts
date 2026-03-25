/**
 * Defines the structure of the user's wardrobe and outfit statistics.
 * This directly maps to the JSON response expected from the /user/stats endpoint.
 */
export interface UserStats {
  total_items: number;
  total_outfits: number;
  favorite_category: string;
}