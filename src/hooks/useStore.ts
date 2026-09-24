import { useState, useEffect } from 'react';
import { store } from '../services/store';

export function useStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    store,
    settings: store.getSettings(),
    categories: store.getCategories(),
    products: store.getProducts(),
    coupons: store.getCoupons(),
    customers: store.getCustomers(),
    orders: store.getOrders(),
    reviews: store.getReviews(),
    media: store.getMedia(),
    cart: store.getCart(),
    wishlist: store.getWishlist(),
    isAdmin: store.isAdmin(),
  };
}
