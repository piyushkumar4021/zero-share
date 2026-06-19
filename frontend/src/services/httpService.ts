import axios from "axios";

const LocalStorageStateKey = "zeroShare";

const httpClient = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const baseUrl = "http://localhost:3000";

httpClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 Request: ${config.method?.toUpperCase()} ${config.url}`,
        config.data,
      );
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  },
);

httpClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ Response: ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    // Handle common errors debugger

    console.log("=== INTERCEPTOR ERROR OBJECT ===");
    console.log("Error keys:", Object.keys(error));
    console.log("Error.message:", error.message);
    console.log("Error.code:", error.code);
    console.log("Error.response:", error.response);
    console.log("Error.request:", error.request);
    console.log("Full error:", error);

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.log("");
          break;
        case 403:
          console.error("Forbidden - Insufficient permissions");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Server error");
          break;
        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      console.error("Network Error - No response received");
    } else {
      console.error("Request Setup Error:", error.message);
    }

    return Promise.reject(error);
  },
);

const httpService = {
  // GET
  get: (url, params = {}, config = {}) =>
    httpClient.get(url, { params, ...config }).then((res) => res.data),

  // POST
  post: (url, data = {}, config = {}) =>
    httpClient.post(url, data, config).then((res) => res.data),

  // PUT
  put: (url, data = {}, config = {}) =>
    httpClient.put(url, data, config).then((res) => res.data),

  // PATCH
  patch: (url, data = {}, config = {}) =>
    httpClient.patch(url, data, config).then((res) => res.data),

  // DELETE
  delete: (url, config = {}) =>
    httpClient.delete(url, config).then((res) => res.data),
};

export default httpService;
