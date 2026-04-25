import config from '../config/index.js'

export function getPartyImageUrl(imagePath) {
  if (!imagePath) return '/static/images/party-placeholder.png';
  if (imagePath.startsWith('http')) return imagePath;
  return `${config.baseURL.replace('/api/v1', '')}${imagePath}`;
}

export function getAvatarUrl(avatarPath) {
  if (!avatarPath) return '/static/images/avatar-placeholder.png';
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${config.baseURL.replace('/api/v1', '')}${avatarPath}`;
}

export function handleImageError(e) {
  const dataset = e.currentTarget.dataset;
  const defaultImage = dataset.default || '/static/images/default-placeholder.png';
  e.currentTarget.src = defaultImage;
}
