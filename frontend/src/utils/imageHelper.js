/**
 * Resize and compress an image file before uploading.
 * Returns a base64 string optimized for storage.
 *
 * @param {File} file - The image file from input
 * @param {number} maxWidth - Max width in pixels (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.8)
 * @returns {Promise<string>} base64 string with data URI prefix
 */
export function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions while keeping aspect ratio
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        // Draw the resized image on a canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with JPEG compression
        const base64 = canvas.toDataURL('image/jpeg', quality)
        resolve(base64)
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Extract just the base64 data (without "data:image/jpeg;base64," prefix).
 * Useful for sending to APIs that expect raw base64.
 */
export function stripBase64Prefix(dataUrl) {
  return dataUrl.split(',')[1] || dataUrl
}