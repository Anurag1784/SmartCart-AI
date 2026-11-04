
const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return '';
  }

  // Find product upload paths in relative or absolute URLs.
  const uploadPath = imageUrl.match(
    /\/uploads\/products\/[^?#]+(?:\?[^#]*)?/
  );

  if (uploadPath) {
    const productApiUrl =
      import.meta.env.VITE_PRODUCT_API_URL ||
      (import.meta.env.VITE_DOCKER === 'true'
        ? ''
        : 'http://localhost:8081');

    // Route product images to Product Service.
    return `${productApiUrl.replace(/\/+$/, '')}${uploadPath[0]}`;
  }

  // Preserve unrelated external image URLs.
  if (
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('http://')
  ) {
    return imageUrl;
  }

  return imageUrl;
};

export default getImageUrl;
