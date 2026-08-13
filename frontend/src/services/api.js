const BASE_URL = "https://bearingiq-r21u.onrender.com";
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  console.log("TOKEN:", token);

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("HEADERS:", headers);

  const response = await fetch(BASE_URL + endpoint, {
    ...options,
    headers,
  });

  console.log("STATUS:", response.status);

  const data = await response.json();

  if (!response.ok) {
    console.log("ERROR RESPONSE:", data);
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
}

// Authentication

export async function loginUser(body) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function registerUser(body) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Prediction

export async function predictBearing(body) {
  return request("/api/prediction/predict", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function predictRandomBearing() {
  return request("/api/prediction/predict-random", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// Dashboard

export async function getPredictionHistory() {
  return request("/api/prediction/history");
}

export async function getPredictionDetails(predictionId) {
  return request(`/api/prediction/${predictionId}`);
}

export async function clearPredictionHistory() {
  return request("/api/prediction/history", {
    method: "DELETE",
  });
}

export async function getActiveModel() {
  return request("/api/prediction/model");
}