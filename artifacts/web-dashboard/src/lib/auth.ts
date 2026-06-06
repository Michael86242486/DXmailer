import { useEffect, useState } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export const API_KEY_STORAGE_KEY = "oraclex_api_key";

export function useAuth() {
  const [apiKey, setApiKeyState] = useState<string | null>(
    localStorage.getItem(API_KEY_STORAGE_KEY)
  );

  useEffect(() => {
    setAuthTokenGetter(() => {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    });
  }, []);

  const setApiKey = (key: string | null) => {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
    setApiKeyState(key);
    // Update getter just in case
    setAuthTokenGetter(() => key);
  };

  return { apiKey, setApiKey };
}
