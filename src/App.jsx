import { useState, useRef } from "react";
import {
  Upload,
  Download,
  Image,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { uploadImages } from "./utils/customFetch";

function App() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState("medium");
  const [format, setFormat] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== selectedFiles.length) {
      setError("Some files were skipped. Only image files are allowed.");
    } else {
      setError("");
    }

    setFiles((prevFiles) => [...prevFiles, ...imageFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== droppedFiles.length) {
      setError("Some files were skipped. Only image files are allowed.");
    } else {
      setError("");
    }

    setFiles((prevFiles) => [...prevFiles, ...imageFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one image");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDownloadUrl("");
    setUploadProgress(0);

    try {
      const uploadResult = await uploadImages(
        files,
        quality,
        format || null,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      setResult(uploadResult); // Store the result
      setDownloadUrl(uploadResult.downloadUrl);
      setUploadProgress(100);
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFiles([]);
    setDownloadUrl("");
    setError("");
    setUploadProgress(0);
    setResult(null); // Reset result too
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="./slimpix.svg"
              alt="slimpix"
              className="w-100 h-32 -mb-5 object-contain"
            />
          </div>
          <p className="text-gray-600">
            Compress and convert your images easily and efficiently.
          </p>
        </div>

        <div className="card mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Images
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50"
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supports: PNG, JPG, WEBP (Max 10 files, 5MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Files ({files.length})
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Image className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-3 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      disabled={isProcessing}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compression Quality
              </label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="low">Low (Smallest file)</option>
                <option value="medium">Medium (Balanced)</option>
                <option value="high">High (Better quality)</option>
                <option value="maximum">Maximum (Best quality)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isProcessing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              >
                <option value="">Keep Original</option>
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          {isProcessing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Processing...
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Uploading and compressing your images...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {downloadUrl && !isProcessing && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    Images compressed successfully!
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download ZIP</span>
                  </button>
                  <div className="text-left mt-8 text-green-800 text-m">
                    <p>Images are automatically deleted after 5 hours</p>
                    <p className="text-sm text-green-800">Expires At</p>
                    <p className="font-semibold text-green-800">
                      {new Date(result.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isProcessing || downloadUrl}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : downloadUrl ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Done!</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Compress Images</span>
                </>
              )}
            </button>

            {(files.length > 0 || downloadUrl) && (
              <button
                onClick={reset}
                disabled={isProcessing}
                className="btn-secondary"
              >
                Reset
              </button>
            )}
          </div>
          <div className="text-center mt-5 text-gray-500 text-sm">
            <p>Images are automatically deleted after 5 hours</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Batch Processing
            </h3>
            <p className="text-sm text-gray-600">
              Compress multiple images at once
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Image className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Format Conversion
            </h3>
            <p className="text-sm text-gray-600">
              Convert to JPG, PNG, or WebP
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Easy Download</h3>
            <p className="text-sm text-gray-600">
              Get all images in a single ZIP
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
