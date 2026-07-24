import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { apiGet } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { ProgressBar } from './ui/Progress.jsx';

/**
 * Up to `max` images. Uses a Cloudinary signed upload when configured;
 * otherwise falls back to a local data-URL preview so reporting still works
 * without Cloudinary keys.
 *
 * value: [{ url, publicId }]  onChange: (images) => void
 */
export default function ImageUploader({ value = [], onChange, max = 4 }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFiles = async (files) => {
    const list = Array.from(files).slice(0, max - value.length);
    if (list.length === 0) return;
    setUploading(true);
    setProgress(0);

    try {
      const sig = await apiGet('/items/upload-signature');
      const uploaded = [];
      for (let i = 0; i < list.length; i += 1) {
        const file = list[i];
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 5MB`);
          continue;
        }
        const img = await uploadOne(file, sig);
        uploaded.push(img);
        setProgress(Math.round(((i + 1) / list.length) * 100));
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeAt = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((img, idx) => (
          <div key={idx} className="relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-hairline">
            <img src={img.url} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute right-1.5 top-1.5 rounded-full bg-ink/60 p-1 text-white backdrop-blur transition hover:bg-ink/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-hairline text-center text-xs text-ink-soft transition hover:border-accent hover:bg-primary-50/40 hover:text-primary-600">
            <ImagePlus className="h-5 w-5" strokeWidth={1.5} />
            <span>Add photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>

      {uploading && (
        <div className="mt-3">
          <ProgressBar value={progress} />
          <p className="mt-1.5 text-xs text-ink-soft">Uploading… {progress}%</p>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-soft/70">Up to {max} images, 5MB each.</p>
    </div>
  );
}

async function uploadOne(file, sig) {
  // Fallback: no Cloudinary -> local data URL preview stored as the image URL.
  if (!sig || sig.fallback) {
    const dataUrl = await fileToDataUrl(file);
    return { url: dataUrl, publicId: '' };
  }
  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', sig.timestamp);
  form.append('signature', sig.signature);
  form.append('folder', sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Cloudinary upload failed');
  const json = await res.json();
  return { url: json.secure_url, publicId: json.public_id };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
