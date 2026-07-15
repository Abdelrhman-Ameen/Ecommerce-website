import { Injectable } from '@angular/core';

export interface ImageOptimizeOptions {
  maxBytes: number;
  maxDimension: number;
}

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  async optimize(file: File, options: ImageOptimizeOptions): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('Choose an image from your gallery or camera');
    if (file.size > 15 * 1024 * 1024) throw new Error('Choose an image smaller than 15 MB');
    const image = await this.load(file);
    let scale = Math.min(1, options.maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    try {
      for (let pass = 0; pass < 6; pass += 1) {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('This browser could not prepare the image');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        for (let quality = .9; quality >= .46; quality -= .08) {
          const blob = await this.toBlob(canvas, quality);
          if (blob.size <= options.maxBytes) return this.toDataUrl(blob);
        }
        scale *= .82;
      }
      throw new Error('This image could not be optimized. Try a smaller photo.');
    } finally {
      URL.revokeObjectURL(image.src);
    }
  }

  private load(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => { URL.revokeObjectURL(image.src); reject(new Error('The selected image could not be read')); };
      image.src = URL.createObjectURL(file);
    });
  }

  private toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Image optimization failed')), 'image/webp', quality));
  }

  private toDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read the optimized image'));
      reader.readAsDataURL(blob);
    });
  }
}
