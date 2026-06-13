import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { storage } from './firebase';

/**
 * Compress an image before upload
 */
const compressImage = async (uri) => {
  const result = await manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.7, format: SaveFormat.WEBP }
  );
  return result.uri;
};

/**
 * Convert a URI to a blob for upload
 */
const uriToBlob = async (uri) => {
  const response = await fetch(uri);
  return await response.blob();
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (userId, imageUri) => {
  const compressedUri = await compressImage(imageUri);
  const blob = await uriToBlob(compressedUri);
  const storageRef = ref(storage, `avatars/${userId}/profile.webp`);
  const snapshot = await uploadBytes(storageRef, blob);
  return await getDownloadURL(snapshot.ref);
};

/**
 * Upload post images (array of URIs)
 */
export const uploadPostImages = async (userId, imageUris) => {
  const uploadPromises = imageUris.map(async (uri, index) => {
    const compressedUri = await compressImage(uri);
    const blob = await uriToBlob(compressedUri);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const storageRef = ref(
      storage,
      `posts/${userId}/${timestamp}_${index}_${random}.webp`
    );
    const snapshot = await uploadBytes(storageRef, blob);
    return await getDownloadURL(snapshot.ref);
  });
  return Promise.all(uploadPromises);
};
