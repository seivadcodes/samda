'use client';

import { createClient } from '@supabase/supabase-js';
import { useState, useCallback } from 'react';

// Supabase client (uses env variables)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET_NAME = 'bale-images';

export default function UploadImagesPage() {
  const [folder, setFolder] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  // Handle folder selection
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setFolder(files);
    setLogs([]);
    setMapping({});
  };

  // Recursively collect all image files from the folder selection
  const collectImageFiles = useCallback((fileList: FileList) => {
    const files: { file: File; relativePath: string }[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      // webkitRelativePath gives the full relative path (e.g., "2025/09/photo.jpg")
      const relativePath = (file as any).webkitRelativePath;
      if (relativePath && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name)) {
        files.push({ file, relativePath });
      }
    }
    return files;
  }, []);

  const startUpload = async () => {
    if (!folder) {
      alert('Please select a folder first.');
      return;
    }

    const imageFiles = collectImageFiles(folder);
    if (imageFiles.length === 0) {
      alert('No image files found in the selected folder.');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: imageFiles.length });
    const newMapping: Record<string, string> = {};

    // Upload each file
    for (let i = 0; i < imageFiles.length; i++) {
      const { file, relativePath } = imageFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      try {
        // Upload to Supabase Storage using relative path as the storage key
        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(relativePath, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) {
          addLog(`❌ Failed: ${relativePath} - ${error.message}`);
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(relativePath);
          const publicUrl = urlData.publicUrl;
          newMapping[relativePath] = publicUrl;
          addLog(`✅ Uploaded: ${relativePath}`);
        }
      } catch (err) {
        addLog(`⚠️ Error uploading ${relativePath}: ${err}`);
      }

      setProgress({ current: i + 1, total: imageFiles.length });
    }

    setMapping(newMapping);
    setUploading(false);
    addLog(`\n🎉 All done! ${Object.keys(newMapping).length} files uploaded.`);
  };

  const downloadMapping = () => {
    const dataStr = JSON.stringify(mapping, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image_mapping.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-4">📸 One-Time Bulk Image Uploader</h1>
      <p className="mb-4 text-gray-600">
        Select your WordPress <code className="bg-gray-100 px-1">wp-content/uploads</code> folder.<br />
        All images will be uploaded to Supabase bucket <strong>{BUCKET_NAME}</strong> preserving folder structure.
      </p>

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Choose folder:</label>
        <input
          type="file"
          // @ts-expect-error - webkitdirectory is not typed but works
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleFolderSelect}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {folder && (
        <button
          onClick={startUpload}
          disabled={uploading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {uploading ? 'Uploading...' : 'Start Upload'}
        </button>
      )}

      {progress.total > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {progress.current} / {progress.total} files
          </p>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Upload Log</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-sm">
            {logs.join('\n')}
          </pre>
        </div>
      )}

      {Object.keys(mapping).length > 0 && (
        <div className="mt-6">
          <button
            onClick={downloadMapping}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            💾 Download image_mapping.json
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Use this JSON file to link images to bales in your migration script.
          </p>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-400 border-t pt-4">
        ⚠️ This page is temporary. Delete it after migration.
      </div>
    </div>
  );
}