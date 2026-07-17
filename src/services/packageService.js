import API from "./Api";

export const getPackages = async () => {
  const { data } = await API.get("/packages");
  return data;
};