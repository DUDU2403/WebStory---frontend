import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';

export default function GlobalSearch({ isOpen, onClose, onSelect, items = [] }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex]);
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

  if (!isOpen) return null;

  const typeLabel = {
    produto: 'Produto',
    pedido: 'Pedido',
    cliente: 'Cliente',
  };

  const typeColor = {
    produto: { bg: '#dbeafe', color: '#1e40af' },
    pedido:  { bg: '#fef3c7', color: '#b45309' },
    cliente: { bg: '#dcfce7', color: '#16a34a' },
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 48px rgba(0,0,0,.2)',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
          animation: 'slideDown 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface-2)',
        }}>
          <Search size={16} color="var(--text-3)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar produtos, pedidos, clientes..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              color: 'var(--text-1)',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 2 }}
            >
              <X size={14} />
            </button>
          )}
          <kbd style={{
            background: 'var(--surface-3)',
            border: '1px solid var(--border)',
            borderRadius: 5,
            padding: '2px 7px',
            fontSize: 11,
            color: 'var(--text-3)',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)' }}>
              <Search size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
              <p style={{ fontSize: 14 }}>
                {query ? 'Nenhum resultado encontrado' : 'Digite para buscar...'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const tc = typeColor[item.type] || { bg: '#f3f4f6', color: '#4b5563' };
              return (
                <button
                  key={item.id}
                  onClick={() => { onSelect(item); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: 'none',
                    borderRadius: 8,
                    background: index === selectedIndex ? 'var(--surface-3)' : 'transparent',
                    color: 'var(--text-1)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 2,
                    transition: 'background 0.1s',
                    fontFamily: 'inherit',
                  }}
                >
                  <span style={{
                    background: tc.bg,
                    color: tc.color,
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                    flexShrink: 0,
                    minWidth: 54,
                    textAlign: 'center',
                  }}>
                    {typeLabel[item.type] || item.type}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    {item.category && (
                      <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{item.category}</p>
                    )}
                  </div>
                  {index === selectedIndex && (
                    <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>↵ abrir</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-2)',
          display: 'flex',
          gap: 14,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
          {[
            { keys: [<ArrowUp size={11} key="u" />, <ArrowDown size={11} key="d" />], label: 'navegar' },
            { keys: ['↵'], label: 'selecionar' },
            { keys: ['ESC'], label: 'fechar' },
          ].map((hint, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-3)' }}>
              {hint.keys.map((k, j) => (
                <kbd key={j} style={{
                  background: 'var(--surface-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  padding: '1px 5px',
                  fontSize: 11,
                  fontFamily: 'inherit',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}>{k}</kbd>
              ))}
              <span>{hint.label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}