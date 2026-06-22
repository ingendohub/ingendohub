import api from "./axiosPublic";

export const loginUser = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
};