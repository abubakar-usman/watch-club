"use client";

import { useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>({
    id: "5d4ff78e-4631-41e6-b496-b50d1cd9d146",
    email: "user@watchclub.demo",
    name: "WatchClub User",
  });
  const [token, setToken] = useState<string | null>("demo-jwt-token");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Demo persistent auth state initialization
    const storedUser = localStorage.getItem("watchclub_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      }
    }
  }, []);

  return {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    setToken,
  };
}
