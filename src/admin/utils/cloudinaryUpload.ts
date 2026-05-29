export async function uploadToCloudinary(file: File, timeoutMs = 60000): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary credentials missing. Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error(`File too large (${(file.size/1024/1024).toFixed(1)}MB). Max allowed is 15MB.`);
  }

  if (!file.type.startsWith("image/")) {
    throw new Error(`Invalid file type "${file.type}". Only images are supported.`);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "kings-diamonds-villas");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData, signal: controller.signal }
    );
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err?.name === "AbortError") {
      throw new Error(`Upload timed out after ${timeoutMs/1000}s. Check your connection or try a smaller image.`);
    }
    if (!navigator.onLine) {
      throw new Error("No internet connection. Check your network and try again.");
    }
    throw new Error(`Network error: ${err?.message || "Unknown error"}. Please try again.`);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let errMsg = `Upload failed (HTTP ${response.status})`;
    try {
      const errData = await response.json();
      if (errData?.error?.message) errMsg = `Cloudinary: ${errData.error.message}`;
      else if (response.status === 400) errMsg = "Upload rejected — ensure your Cloudinary upload preset is set to Unsigned.";
      else if (response.status === 401 || response.status === 403) errMsg = "Auth failed — check your Cloud Name and Upload Preset.";
      else if (response.status >= 500) errMsg = "Cloudinary server error. Wait a moment and retry.";
    } catch {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  if (!data.secure_url) throw new Error("Cloudinary returned no URL. Please try again.");
  return data.secure_url;
}
