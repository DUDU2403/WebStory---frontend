import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children, codigoLoja }) {
  const KEY = `cart_${codigoLoja}`;
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, KEY]);

  const addItem = (produto, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i._id === produto._id);
      if (existing) {
        return prev.map(i =>
          i._id === produto._id ? { ...i, quantidade: i.quantidade + qty } : i
        );
      }
      return [...prev, {
        _id: produto._id,
        nome: produto.nome,
        preco: produto.emPromocao && produto.precoPromo ? produto.precoPromo : produto.preco,
        imagemUrl: produto.imagemUrl,
        quantidade: qty,
      }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(i => i._id === id ? { ...i, quantidade: qty } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const count = items.reduce((s, i) => s + i.quantidade, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);