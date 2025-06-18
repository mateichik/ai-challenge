export interface ProductQuery {
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  categories?: string[];
  inStock?: boolean;
} 