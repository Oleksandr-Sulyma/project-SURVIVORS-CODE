import axios from 'axios';
import { baseUrl } from './constants';

const api = axios.create({
  baseURL: baseUrl,
});

// API ендпоінт №2: функция getAllProducts(). Не приймає параметри, повертає проміс з даними (всі продукти з пагінацією)
export const getBookById = async id => {
  try {
    const response = await api.get(`/books/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// _id  price   title
