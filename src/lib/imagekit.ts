import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface ImageKitConfig {
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  id: string;
}

// Credentials provided by the user as default fallback
export const DEFAULT_IMAGEKIT_CONFIG: ImageKitConfig = {
  publicKey: 'public_OWsF7ZU5tnpA+tMKiXXwRTD36FM=',
  privateKey: 'private_duDUm/vzbPwv4Chm8jPpMfGOyX0=',
  urlEndpoint: 'https://ik.imagekit.io/CodeCrafters',
  id: 'CodeCrafters',
};

/**
 * Fetches current active ImageKit credentials from Firestore, 
 * falling back to default credentials if not configured in DB yet.
 */
export async function getImageKitConfig(): Promise<ImageKitConfig> {
  try {
    const configDocRef = doc(db, 'settings', 'imagekit');
    const docSnap = await getDoc(configDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const config = {
        publicKey: data.publicKey || DEFAULT_IMAGEKIT_CONFIG.publicKey,
        privateKey: data.privateKey || DEFAULT_IMAGEKIT_CONFIG.privateKey,
        urlEndpoint: data.urlEndpoint || DEFAULT_IMAGEKIT_CONFIG.urlEndpoint,
        id: data.id || DEFAULT_IMAGEKIT_CONFIG.id,
      };
      console.log('ImageKit config fetched from Firestore:', config);
      return config;
    }
  } catch (err: any) {
    console.warn('ImageKit config fetch error (using defaults):', err.message);
  }
  return DEFAULT_IMAGEKIT_CONFIG;
}

/**
 * Saves ImageKit credentials to Firestore settings.
 */
export async function saveImageKitConfig(config: ImageKitConfig): Promise<void> {
  const configDocRef = doc(db, 'settings', 'imagekit');
  await setDoc(configDocRef, {
    ...config,
    updatedAt: new Date().toISOString(),
  });
}

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  size: number;
  filePath: string;
  url: string;
  fileType: string;
  thumbnailUrl?: string;
}

/**
 * Uploads a file (either a binary File/Blob, or a Base64 string) to ImageKit.
 * Handles resizing or optimizations automatically where necessary.
 */
export async function uploadFileToImageKit(
  file: File | Blob | string,
  fileName: string,
  folder: string = '/general'
): Promise<ImageKitUploadResponse> {
  const config = await getImageKitConfig();
  
  if (!config.privateKey) {
    throw new Error('ImageKit Private Key is not configured. Please supply keys in Settings.');
  }

  const formData = new FormData();
  
  // Format the file correctly
  if (typeof file === 'string') {
    // base64 string
    formData.append('file', file);
  } else {
    // binary File or Blob object
    formData.append('file', file, fileName);
  }

  formData.append('fileName', fileName);
  formData.append('useUniqueFileName', 'true');
  formData.append('folder', folder);
  formData.append('privateKey', config.privateKey);

  const response = await fetch('/api/upload-imagekit', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr;
    try {
      parsedErr = JSON.parse(errText);
    } catch {
      parsedErr = { message: errText };
    }
    throw new Error(parsedErr?.message || `ImageKit Upload Failed with status ${response.status}`);
  }

  const result = await response.json();
  return {
    fileId: result.fileId,
    name: result.name,
    size: result.size,
    filePath: result.filePath,
    url: result.url,
    fileType: result.fileType,
    thumbnailUrl: result.thumbnailUrl,
  };
}
