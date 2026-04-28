/* eslint-disable @typescript-eslint/no-explicit-any */

const AUTH_API_URI = process.env.NEXT_PUBLIC_AUTH_API_URI;
const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;

export interface LoginPayload {
  user_name: string;
  password: string;
}

export const loginUser = async (data: LoginPayload): Promise<any> => {
  try {
    // console.log("Login payload:", data);
    // console.log(
    //   "Login endpoint:",
    //   `${AUTH_API_URI}/login?client_id=${CLIENT_ID}`
    // );

    const response = await fetch(
      `${AUTH_API_URI}/login?client_id=${CLIENT_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    // console.log("Login response status:", response.status);

    const text = await response.text();

    // console.log("Login raw response:", text);

    if (!response.ok) {
      throw new Error(text || "Login failed");
    }

    const result = JSON.parse(text);

    // console.log("Login success:", result);
    // if (result?.jwt) {
    //   sessionStorage.setItem("jwt", result.jwt);
    // }

    // if (result?.refresh_token) {
    //   sessionStorage.setItem("refresh_token", result.refresh_token);
    // }
    if (typeof window !== "undefined") {
      const jwt = result?.jwt || result?.data?.jwt || result?.access_token;
      const refreshToken =
        result?.refresh_token ||
        result?.data?.refresh_token ||
        result?.refreshToken;

      // if (jwt) {
      //   sessionStorage.setItem("jwt", jwt);
      // }

      // if (refreshToken) {
      //   sessionStorage.setItem("refresh_token", refreshToken);
      // }

      if (jwt) {
        sessionStorage.setItem("jwt", jwt);

        document.cookie = `jwt=${encodeURIComponent(
          jwt
        )}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
      }

      if (refreshToken) {
        sessionStorage.setItem("refresh_token", refreshToken);
      }

      sessionStorage.setItem("login_response", JSON.stringify(result));

      // console.log("Saved JWT:", sessionStorage.getItem("jwt"));
      // console.log("Saved refresh token:", sessionStorage.getItem("refresh_token"));
    }

    return result;
  } catch (error) {
    // console.error("Login service error:", error);
    throw error;
  }
};