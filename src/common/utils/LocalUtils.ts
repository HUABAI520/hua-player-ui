export const setLocal = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};
export const getLocal = (key: string, defaultValue?: any) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
};
export const deleteLocal = (key: string) => {
  localStorage.removeItem(key);
};
