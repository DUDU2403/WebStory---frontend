import { useState } from 'react';
import { Upload, Camera, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUploader({ onImageSelect, label = 'Selecionar imagem', maxSizeMB = 5 }) {
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    // Valida tipo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Valida tamanho
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`Imagem muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Lê arquivo e converte para Base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      setPreview(base64);
      onImageSelect(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => handleFile(e.target.files?.[0]);
    input.click();
  };

  const handleGaleria = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFile(e.target.files?.[0]);
    input.click();
  };

  const clearImage = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null);
  };

  return (
    <div>
      {preview ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', backgroundColor: 'var(--surface-2)' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} />
          <button
            onClick={clearImage}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0,0,0,.5)',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: 6,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: 12,
            padding: 24,
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'var(--surface-3)' : 'transparent',
            transition: 'all 0.2s'
          }}
          onClick={handleGaleria}
        >
          <Upload size={32} style={{ margin: '0 auto 12px', color: 'var(--text-3)' }} />
          <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--text-1)' }}>{label}</p>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12 }}>Arraste uma imagem aqui ou clique</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleCamera(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Camera size={14} /> Câmera
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleGaleria(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--text-2)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <ImageIcon size={14} /> Galeria
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
