/* eslint-disable @typescript-eslint/no-explicit-any */

const AUTH_API_URI = process.env.NEXT_PUBLIC_AUTH_API_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

export interface LogoutResponse {
  status?: string;
  message?: string;
  data?: any;
}

export const logoutUser = async (): Promise<LogoutResponse | string | null> => {
  if (typeof window === "undefined") return null;

  const refreshToken = sessionStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.warn("No refresh token found for logout");
    return null;
  }

  if (!AUTH_API_URI || !CLIENT_ID) {
    throw new Error("Missing NEXT_PUBLIC_AUTH_API_URI or NEXT_PUBLIC_CLIENT_ID");
  }

  const response = await fetch(`${AUTH_API_URI}/logout?client_id=${CLIENT_ID}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: "no-store",
  });

  // console.log("Logout status:", response.status);

  const text = await response.text();
  // console.log("Logout raw response:", text);

  let data: LogoutResponse | string = text;

  try {
    data = JSON.parse(text);
    // console.log("Logout JSON response:", data);
  } catch {
    console.warn("Logout response is not JSON");
  }

  if (!response.ok) {
    console.error("Logout failed:", data);
    throw new Error(
      typeof data === "string" ? data : data.message || "Logout failed"
    );
  }

  // console.log("Logout success:", data);

  return data;
};

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("jwt");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("login_response");
  sessionStorage.removeItem("user");

  localStorage.removeItem("authToken");
  localStorage.removeItem("user");

  document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";
};