/**
 * Service d'upload d'images vers Cloudinary.
 * Fallback vers une URL data: base64 si Cloudinary n'est pas configuré
 * (pratique pour le développement local / tests).
 */

interface UploadImageResult {
  url: string;
  publicId?: string;
}

export class UploadService {
  private cloudName: string | undefined;
  private apiKey: string | undefined;
  private apiSecret: string | undefined;
  private uploadPreset: string | undefined;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.apiKey = process.env.CLOUDINARY_API_KEY;
    this.apiSecret = process.env.CLOUDINARY_API_SECRET;
    this.uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  }

  /**
   * Détermine si Cloudinary est configuré.
   */
  isCloudinaryConfigured(): boolean {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret);
  }

  /**
   * Upload une image base64 vers Cloudinary, ou renvoie la base64 si non configuré.
   * @param base64Image - data:image/...;base64,... ou URL http(s)
   * @param folder - dossier Cloudinary (optionnel)
   */
  async uploadImage(base64Image: string, folder = 'solideat'): Promise<UploadImageResult> {
    // Si c'est déjà une URL externe, la retourner telle quelle
    if (base64Image.startsWith('http://') || base64Image.startsWith('https://')) {
      return { url: base64Image };
    }

    // Fallback local si Cloudinary n'est pas configuré
    if (!this.isCloudinaryConfigured()) {
      console.warn('⚠️ Cloudinary non configuré, utilisation du stockage base64 local.');
      return { url: base64Image };
    }

    try {
      const formData = new FormData();
      formData.append('file', base64Image);
      formData.append('api_key', this.apiKey!);
      if (this.uploadPreset) {
        formData.append('upload_preset', this.uploadPreset);
      }
      if (folder) {
        formData.append('folder', folder);
      }

      const timestamp = Math.round(Date.now() / 1000).toString();
      formData.append('timestamp', timestamp);

      // Signature SHA1 requise pour l'upload signé
      const { createHash } = await import('crypto');
      const signaturePayload = `folder=${folder}&timestamp=${timestamp}${this.apiSecret!}`;
      const signature = createHash('sha1').update(signaturePayload).digest('hex');
      formData.append('signature', signature);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudinary upload failed: ${response.status} ${errorText}`);
      }

      const data = (await response.json()) as { secure_url: string; public_id: string };
      return {
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error: any) {
      console.error('Erreur upload Cloudinary:', error.message);
      // En cas d'échec, on retourne quand même la base64 pour ne pas bloquer le flux
      return { url: base64Image };
    }
  }

  /**
   * Valide un fichier image base64 ou URL.
   */
  validateImage(image: string): { valid: boolean; error?: string } {
    if (!image || typeof image !== 'string') {
      return { valid: false, error: 'Image requise' };
    }
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return { valid: true };
    }
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const match = image.match(/^data:(image\/\w+);base64,/);
    if (!match) {
      return { valid: false, error: 'Format de photo invalide' };
    }
    if (!allowedMimeTypes.includes(match[1])) {
      return { valid: false, error: 'Formats acceptés : JPEG, PNG, WEBP' };
    }

    // Limite ~5 Mo en base64
    const base64Size = image.length * 0.75;
    if (base64Size > 5 * 1024 * 1024) {
      return { valid: false, error: 'La photo ne doit pas dépasser 5 Mo' };
    }

    return { valid: true };
  }
}

export const uploadService = new UploadService();
