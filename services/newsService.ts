import axios from 'axios';
import { NewsResponse } from '../types/news';

const API_KEY = 'a718dfaf6e8c47958db169495cd5b0a1';
const BASE_URL = 'https://newsapi.org/v2';

export const getTopHeadlines = async (country: string = 'tr', category?: string): Promise<NewsResponse> => {
  try {
    const params: any = {
      country,
      apiKey: API_KEY
    };
    
    if (category) {
      params.category = category;
    }

    const response = await axios.get(`${BASE_URL}/top-headlines`, { params });
    return response.data;
  } catch (error) {
    console.error('Haberler alınamadı:', error);
    throw new Error('Haberler alınamadı');
  }
};

export const searchNews = async (query: string, language: string = 'tr'): Promise<NewsResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}/everything`, {
      params: {
        q: query,
        language,
        sortBy: 'publishedAt',
        apiKey: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Arama sonuçları alınamadı:', error);
    throw new Error('Arama sonuçları alınamadı');
  }
};

export const getNewsByCategory = async (category: string, country: string = 'tr'): Promise<NewsResponse> => {
  return getTopHeadlines(country, category);
}; 