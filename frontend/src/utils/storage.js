const CART_KEY = "cart";
const TOKEN_KEY = "token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

export const setCart = (cart) =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

export const addToCart = (item) => {
  const cart = getCart();
  const existing = cart.find((c) => c.product_id === item.product_id);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setCart(cart);
  return cart;
};

export const removeFromCart = (productId) => {
  const cart = getCart().filter((c) => c.product_id !== productId);
  setCart(cart);
  return cart;
};

export const clearCart = () => setCart([]);
