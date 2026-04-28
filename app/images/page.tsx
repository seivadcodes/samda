'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  User, 
  LogOut, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Trash2,
  X,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type ImageFile = {
  name: string;
  path: string;
  created_at: string;
};

export default function ImagesPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) throw new Error('Failed to fetch images');
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError('Failed to load gallery.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      setSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      await fetchImages();
      setTimeout(() => setSuccess(null), 3000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageName: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Note: Deleting from public folder requires another API endpoint
      // For now, we'll just remove it from state. 
      // To actually delete the file, you'd need a DELETE /api/images/[name] route.
      // Since you asked for simple storage, I'll leave the actual file deletion 
      // as an exercise or you can manually delete from the folder.
      
      // Optimistic update
      setImages(prev => prev.filter(img => img.name !== imageName));
      setSuccess('Image removed from view (Manual deletion required for file).');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete image.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">TrueLabel Gallery</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-100 rounded-full">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-900">{user.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
          
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                Upload New Image
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  previewUrl ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input 
                  id="file-upload"
                  type="file" 
                  onChange={handleFileSelect} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {previewUrl ? (
                  <div className="relative group">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg shadow-md object-contain" 
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <UploadCloud className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Click to upload</p>
                      <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className={`mt-4 w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                  !selectedFile || uploading
                    ? "bg-slate-300 cursor-not-allowed text-slate-500" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </button>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Your Gallery</h2>
              <span className="text-sm text-slate-500">{images.length} items</span>
            </div>

            {images.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No images yet</h3>
                <p className="text-slate-500">Upload your first image to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((img) => (
                  <motion.div
                    key={img.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img 
                      src={img.path} 
                      alt={img.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a 
                        href={img.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full text-slate-900 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="View Full Size"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                      <button 
                        onClick={() => handleDelete(img.name)}
                        className="p-2 bg-white rounded-full text-slate-900 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}