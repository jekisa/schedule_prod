'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return res.json();
};

// Dashboard
export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchWithAuth('/api/dashboard'),
  });
};

// Users
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => fetchWithAuth('/api/users'),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/users', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchWithAuth(`/api/users?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

// Suppliers
export const useSuppliers = (type = null) => {
  return useQuery({
    queryKey: ['suppliers', type],
    queryFn: async () => {
      const data = await fetchWithAuth('/api/suppliers');
      if (type) {
        return { suppliers: data.suppliers?.filter(s => s.supplier_type === type) || [] };
      }
      return data;
    },
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/suppliers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/suppliers', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchWithAuth(`/api/suppliers?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
};

// Articles
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => fetchWithAuth('/api/articles'),
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/articles', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth('/api/articles', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchWithAuth(`/api/articles?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['articles'] }),
  });
};

// Schedules
export const useSchedules = (type) => {
  return useQuery({
    queryKey: ['schedules', type],
    queryFn: () => fetchWithAuth(`/api/schedules/${type}`),
  });
};

export const useCreateSchedule = (type) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth(`/api/schedules/${type}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', type] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useUpdateSchedule = (type) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => fetchWithAuth(`/api/schedules/${type}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', type] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useDeleteSchedule = (type) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => fetchWithAuth(`/api/schedules/${type}?id=${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', type] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
