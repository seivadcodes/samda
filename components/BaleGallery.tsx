'use client';

import { useState } from 'react';

type BaleGalleryProps = {
  mainImage: string | null;
  secondaryImages: string[] | null;
  baleName: string;
};

export default function BaleGallery({ mainImage, secondaryImages, baleName }: BaleGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(mainImage);

  return (
    <div className="bale-gallery">
      <div className="main-image">
        {activeImage ? (
          <img src={activeImage} alt={baleName} />
        ) : (
          <div className="no-image" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
            No image available
          </div>
        )}
      </div>
      
      {secondaryImages && secondaryImages.length > 0 && (
        <div className="thumbnails">
          {secondaryImages.map((url: string, idx: number) => (
            <img
              key={idx}
              src={url}
              alt={`Sample ${idx + 1}`}
              onClick={() => setActiveImage(url)}
              style={{ 
                cursor: 'pointer', 
                border: activeImage === url ? '2px solid #4f46e5' : '1px solid #e2e8f0'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}