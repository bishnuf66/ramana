import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/api';
import { Tables } from '@/types/database.types';

type Category = Tables<'categories'>;

interface CategoriesResponse {
  categories: Category[];
}

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axiosInstance.get('/categories');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
