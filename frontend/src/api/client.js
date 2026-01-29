const parseJson = async (res) => {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
};

export const apiRequest = async (url, options = {}) => {
  const res = await fetch(url, options);
  const data = await parseJson(res);
  if (!res.ok) {
    const message = data?.message || res.statusText || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const authRequest = async (url, token, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`
  };
  return apiRequest(url, { ...options, headers });
};
