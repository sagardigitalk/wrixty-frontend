export const isAuthenticated = (): boolean => {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("wrixty_authenticated");
  }
  return false;
};

export const getAuthenticatedUser = (): any => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("wrixty_authenticated_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse wrixty_authenticated_user", e);
      }
    }
  }
  return null;
};

export const setAuthData = (user: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wrixty_authenticated", "true");
    localStorage.setItem("wrixty_authenticated_user", JSON.stringify(user));
  }
};

export const clearAuthData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("wrixty_authenticated");
    localStorage.removeItem("wrixty_authenticated_user");
    localStorage.removeItem("wrixty_token");
  }
};
