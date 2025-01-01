import { create } from "zustand";

const initialState = {};

const cartState = (set, get) => ({
  cart: initialState,

  getCart: () => get().cart,

  addToCart: (item, newQuantity) => {
    const id = item?.name;
    const currentCart = get().cart;
    const exists = currentCart[id];

    if (!exists) {
      set((state) => ({
        ...state,
        [id]: {
          id,
          item,
          quantity: newQuantity,
        },
      }));
    } else {
      set((state) => ({
        ...state,
        [id]: {
          item,
          quantity: quantity + newQuantity,
        },
      }));
    }
  },

  reset: () => {
    set((state) => ({
      ...state,
      cart: initialState,
    }));
    return get().cart;
  },

  removeItem: (item) => {
    const updatedCart = set((state) => ({
      ...state,
      cart: initialState,
    }));
    return get().cart;
  },
});

const useCartStore = create(cartState);

export default useCartStore;
