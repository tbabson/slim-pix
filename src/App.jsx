import { useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  CheckCircle,
  XCircle,
  ImageIcon,
} from "lucide-react";
import { uploadImages } from "./utils/customFetch";

function App() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState("medium");
  const [format, setFormat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setError(null);
    setResult(null);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      setFiles(droppedFiles);
      setError(null);
      setResult(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const data = await uploadImages(files, quality, format || null);
      setResult(data);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFiles([]);
    setQuality("medium");
    setFormat("");
    setResult(null);
    setError(null);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <ImageIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SlimPix</h1>
          <p className="text-gray-600">
            Compress your images without losing quality
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          {!result ? (
            <>
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
                  dragActive
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300 hover:border-primary-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Drag & drop images here
                </p>
                <p className="text-gray-500 mb-4">or</p>
                <label className="btn-primary cursor-pointer inline-block">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Supports: JPG, PNG, WebP, GIF (Max 10 files, 5MB each)
                </p>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Selected Files ({files.length})
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 truncate flex-1">
                          {file.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Quality Setting */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compression Quality
                  </label>
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">Low (Smallest file size)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Better quality)</option>
                    <option value="maximum">Maximum (Best quality)</option>
                  </select>
                </div>

                {/* Format Setting */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Output Format (Optional)
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Keep Original</option>
                    <option value="webp">WebP</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Compressing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Compress Images
                    </>
                  )}
                </button>
                {files.length > 0 && (
                  <button onClick={handleReset} className="btn-secondary">
                    Clear
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Success Result */
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Compression Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your images have been compressed and are ready to download
              </p>
              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Batch ID</p>
                    <p className="font-semibold text-gray-800">
                      {result.batchId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires At</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(result.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              {/* Download Button */}
              href={result.downloadUrl}
              className="btn-primary inline-flex items-center mb-4" download
              <a>
                <Download className="w-5 h-5 mr-2" />
                Download ZIP
              </a>
              {/* Start Over Button */}
              <button onClick={handleReset} className="btn-secondary w-full">
                Compress More Images
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Files are automatically deleted after 5 hours</p>
        </div>
      </div>
    </div>
  );
}

export default App;
