
```
Search (or 'exit' to quit): I need a smartphone under $800 with good ratings

Processing your query...
[INFO] Parsing user query: "I need a smartphone under $800 with good ratings"
Understood your query as: {
  "keywords": [
    "smartphone"
  ],
  "maxPrice": 800,
  "minRating": 4
}
[INFO] Loading products from /home/anton/ai-challenge/20-06-2025-product-search/products.json
[INFO] Loaded 50 products
[INFO] Filtering products using OpenAI
[INFO] Found 1 products matching the criteria

Found 1 matching products:

1. Smartphone
   Category: Electronics
   Price: $799.99
   Rating: 4.5/5
   In Stock: No

Matching explanation: The only product that contains the keyword 'smartphone', has a price less than or equal to 800, and a rating of at least 4 is the 'Smartphone' with a price of 799.99 and a rating of 4.5. Although it is not in stock, it meets the specified criteria for filtering.
```

---

```
Search (or 'exit' to quit): afjnwaefinfiaowfnweifneoiawefunwoeaiufn

Processing your query...
[INFO] Parsing user query: "afjnwaefinfiaowfnweifneoiawefunwoeaiufn"
Understood your query as: {
  "keywords": [
    "afjnwaefinfiaowfnweifneoiawefunwoeaiufn"
  ]
}
[INFO] Loading products from /home/anton/ai-challenge/20-06-2025-product-search/products.json
[INFO] Loaded 50 products
[INFO] Filtering products using OpenAI
[INFO] Found 0 products matching the criteria

No products found matching your criteria.
```

---
```
Search (or 'exit' to quit): what is the cheapest electronics item?

Processing your query...
[INFO] Parsing user query: "what is the cheapest electronics item?"
Understood your query as: {
  "categories": [
    "Electronics"
  ],
  "findMinPrice": true
}
[INFO] Loading products from /home/anton/ai-challenge/20-06-2025-product-search/products.json
[INFO] Loaded 50 products
[INFO] Filtering products using OpenAI
[INFO] Found 1 products matching the criteria

Found 1 matching products:

1. Portable Charger
   Category: Electronics
   Price: $29.99
   Rating: 4.2/5
   In Stock: Yes

Matching explanation: Among the products in the Electronics category, the Portable Charger has the lowest price at $29.99.

Search (or 'exit' to quit):
```
---
```
Search (or 'exit' to quit): I want something to read

Processing your query...
[INFO] Parsing user query: "I want something to read"
Understood your query as: {
  "keywords": [
    "read"
  ]
}
[INFO] Loading products from /home/anton/ai-challenge/20-06-2025-product-search/products.json
[INFO] Loaded 50 products
[INFO] Filtering products using OpenAI
[INFO] Found 2 products matching the criteria

Found 2 matching products:

1. Programming Guide
   Category: Books
   Price: $49.99
   Rating: 4.7/5
   In Stock: Yes

2. Self-Help Guide
   Category: Books
   Price: $19.99
   Rating: 4.2/5
   In Stock: Yes

Matching explanation: The products filtered contain the keyword 'read' in the context of products that are related to reading or guides for reading. Specifically, 'Programming Guide' and 'Self-Help Guide' match the keyword as they are types of reading materials.
```

---
```
Search (or 'exit' to quit): show me a fitness product with a lowest rating

Processing your query...
[INFO] Parsing user query: "show me a fitness product with a lowest rating"
Understood your query as: {
  "categories": [
    "Fitness"
  ],
  "findMinRating": true
}
[INFO] Loading products from /home/anton/ai-challenge/18-06-2025-product-search/products.json
[INFO] Loaded 50 products
[INFO] Filtering products using OpenAI
[INFO] Found 1 products matching the criteria

Found 1 matching products:

1. Jump Rope
   Category: Fitness
   Price: $9.99
   Rating: 4/5
   In Stock: Yes

Matching explanation: First, I filtered the products to include only those in the 'Fitness' category. This resulted in a subset of products all belonging to 'Fitness'. Then, since the criteria specified 'findMinRating' as true, I identified the product(s) with the lowest rating among this filtered subset. The product 'Jump Rope' has the lowest rating of 4.0 among all 'Fitness' products, so it is the only product returned.
```