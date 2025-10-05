import { useState, useCallback } from 'react';

// Hook personnalisé pour gérer les opérations asynchrones
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction(...args);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Une erreur est survenue';
      setError(errorMessage);
      throw err; // Re-throw pour permettre la gestion d'erreur côté appelant
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
}

// Hook spécialisé pour les opérations CRUD
export function useCRUD(apiService) {
  const { loading, error, execute, reset } = useAsync();

  const create = useCallback((data) => execute(apiService.create, data), [execute, apiService]);
  const getAll = useCallback((params) => execute(apiService.getAll, params), [execute, apiService]);
  const getById = useCallback((id) => execute(apiService.getById, id), [execute, apiService]);
  const update = useCallback((id, data) => execute(apiService.update, id, data), [execute, apiService]);
  const deleteItem = useCallback((id) => execute(apiService.delete, id), [execute, apiService]);

  return {
    loading,
    error,
    create,
    getAll,
    getById,
    update,
    delete: deleteItem,
    reset
  };
}