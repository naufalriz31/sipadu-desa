import axiosClient from "./axiosClient";

export const loginAdmin = (username, password) =>
  axiosClient.post("/auth/login", { username, password });

export const loginCitizen = (userData) =>
  axiosClient.post("/auth/citizen-login", userData);

