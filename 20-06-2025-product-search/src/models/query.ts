export interface ProductQuery {
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  categories?: string[];
  inStock?: boolean;
  findMinPrice?: boolean;
  findMaxPrice?: boolean;
  findMinRating?: boolean;
  findMaxRating?: boolean;
} 