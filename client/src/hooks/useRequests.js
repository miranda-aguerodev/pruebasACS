import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { getRequests } from "../services/requestService";

export function useRequests(filters = {}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filtersKey = JSON.stringify(filters);

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const currentFilters = JSON.parse(filtersKey);

      const data = await getRequests(currentFilters);

      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filtersKey]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return {
    requests,
    loading,
    error,
    reload: loadRequests,
  };
}