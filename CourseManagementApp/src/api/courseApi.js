// src/api/courseApi.js

// Đã gắn sẵn Project ID MockAPI của bạn (tự động thử cả /api/v1 và gốc)
const PRIMARY_URL = 'https://6ad5ba9e48476c0785d9a1d2.mockapi.io/api/v1';
const FALLBACK_URL = 'https://6ad5ba9e48476c0785d9a1d2.mockapi.io';

let activeBaseUrl = PRIMARY_URL;

const request = async (endpoint, options = {}) => {
  let response = await fetch(`${activeBaseUrl}${endpoint}`, options);

  // Nếu project MockAPI của bạn không có đuôi /api/v1 thì tự động chuyển sang FALLBACK_URL
  if (response.status === 404 && activeBaseUrl === PRIMARY_URL) {
    const fallbackRes = await fetch(`${FALLBACK_URL}${endpoint}`, options);
    if (fallbackRes.ok) {
      activeBaseUrl = FALLBACK_URL;
      response = fallbackRes;
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Lỗi HTTP: ${response.status}`);
  }
  return response.json();
};

// ================= CATEGORIES API =================
export const getCategories = () => request('/categories');

export const createCategory = (categoryData) =>
  request('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });

export const updateCategory = (id, categoryData) =>
  request(`/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData),
  });

export const deleteCategory = (id) =>
  request(`/categories/${id}`, {
    method: 'DELETE',
  });

// ================= COURSES API =================
export const getCourses = () => request('/courses');

export const getCourseById = (id) => request(`/courses/${id}`);

export const createCourse = (courseData) =>
  request('/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });

export const updateCourse = (id, courseData) =>
  request(`/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData),
  });

export const deleteCourse = (id) =>
  request(`/courses/${id}`, {
    method: 'DELETE',
  });