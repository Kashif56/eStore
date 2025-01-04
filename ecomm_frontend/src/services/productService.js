import axiosInstance from '../utils/axiosInstance';

export const api = axiosInstance;

export const fetchProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/sellers/products/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/api/sellers/products/${productId}/delete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axiosInstance.get('/api/sellers/categories/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSubcategories = async (categoryId) => {
  try {
    const response = await axiosInstance.get(`/api/sellers/categories/${categoryId}/subcategories/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchVariants = async (categoryId) => {
  try {
    const response = await axiosInstance.get(`/api/sellers/variants/?category=${categoryId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addProduct = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/sellers/products/add/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadProductImage = async (productId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axiosInstance.post(`/api/sellers/products/${productId}/images/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchProduct = async (productId) => {
  try {
    const response = await axiosInstance.get(`/api/sellers/products/${productId}/edit/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await axiosInstance.put(
      `/api/sellers/products/${productId}/update/`, 
      productData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteProductImage = async (productId, imageId) => {
  try {
    const response = await axiosInstance.delete(`/api/sellers/products/${productId}/images/${imageId}/delete/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
