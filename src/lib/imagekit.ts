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

  let response: Response;
  const maxRetries = 3;
  let delay = 1000;

  for (let attempt = 1;; attempt++) {
    try {
      response = await fetch('/api/upload-imagekit', {
        method: 'POST',
        body: formData,
      });

      // Verify that the response is actually valid JSON and not a raw HTML fallback
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      if (!response.ok || !isJson) {
        // Probe response text safely using clone to avoid exhausting the response body
        const rawText = await response.clone().text();
        const firstChars = rawText.trim().toLowerCase();
        const hasHtmlIndicator = firstChars.startsWith('<!doctype') || firstChars.startsWith('<html') || firstChars.startsWith('<head');
        
        if (hasHtmlIndicator || response.status === 502 || response.status === 503 || response.status === 504) {
          throw new Error(`Server returned HTML / Proxy temporary error (status ${response.status}). The application might be warming up.`);
        }
      }
      break; // Exit loop on successful JSON-like validation
    } catch (err: any) {
      if (attempt >= maxRetries) {
        throw new Error(`ImageKit secure upload server unreachable after ${maxRetries} compilation attempts: ${err.message || 'System reload'}. Please verify the Operations Panel is active and try again.`);
      }
      console.warn(`[ImageKit Retry] Fetch attempt ${attempt}/${maxRetries} met an issue: ${err.message || err}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const parsedErr = await response.json();
      throw new Error(parsedErr?.message || `ImageKit Upload Failed with status ${response.status}`);
    } else {
      const errText = await response.text();
      throw new Error(errText || `ImageKit Upload Failed with status ${response.status}`);
    }
  }

  if (!isJson) {
    const textBody = await response.text();
    throw new Error(`Unexpected non-JSON response from upload server: ${textBody.slice(0, 100)}`);
  }

  let result;
  try {
    result = await response.json();
  } catch (jsonErr: any) {
    throw new Error(`Failed to parse server upload response as JSON: ${jsonErr.message}`);
  }

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
