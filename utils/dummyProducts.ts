export interface Product {
  id: number;
  image: string;
  price: number;
  discountPrice?: number;
  rating: number;
  title: string;
  description?: string;
}

export const products: Product[] = [
  {
    id: 1,
    image: "/images/fruits/apples.webp",
    price: 29.99,
    discountPrice: 24.99,
    rating: 4.5,
    title: "Apple",
    description: "Fresh and juicy red apples, perfect for snacking or baking.",
  },
  {
    id: 2,
    image: "/images/fruits/oranges.webp",
    price: 49.99,
    discountPrice: 39.99,
    rating: 3.5,
    title: "Orange",
    description: "Sweet and tangy oranges packed with Vitamin C.",
  },
  {
    id: 3,
    image: "/images/fruits/strawberry.jpg",
    price: 19.99,
    discountPrice: 14.99,
    rating: 5,
    title: "Strawberry",
    description: "Ripe and delicious strawberries, great for smoothies and desserts.",
  },
  {
    id: 4,
    image: "/images/fruits/banana.jpg",
    price: 16.99,
    discountPrice: 15.99,
    rating: 5,
    title: "Banana",
    description: "Rich in potassium, these bananas are ideal for a healthy diet.",
  },
  {
    id: 5,
    image: "/images/fruits/grapes.jpg",
    price: 12.99,
    discountPrice: 17.99,
    rating: 5,
    title: "Grapes",
    description: "Seedless grapes, perfect for snacking and making fresh juice.",
  },
  {
    id: 6,
    image: "/images/fruits/mango.webp",
    price: 11.99,
    discountPrice: 16.99,
    rating: 5,
    title: "Mango",
    description: "Tropical mangoes with a rich, sweet flavor.",
  },
  {
    id: 7,
    image: "/images/fruits/peaches.webp",
    price: 13.99,
    discountPrice: 17.49,
    rating: 5,
    title: "Peaches",
    description: "Juicy peaches, perfect for snacking or making fruit salads.",
  },
  {
    id: 8,
    image: "/images/fruits/WATERMELON.jpg",
    price: 15.99,
    discountPrice: 14.99,
    rating: 5,
    title: "Watermelon",
    description: "Refreshing watermelon with a naturally sweet taste.",
  },
];



