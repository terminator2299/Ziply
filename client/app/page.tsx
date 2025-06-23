"use client";

// This file should be renamed to page.client.tsx to enable Client Component features.
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { PhotoIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import Image from 'next/image';

const TABS = [
  { label: "Compress Image", key: "compress" },
  { label: "Merge PDFs", key: "merge" },
  { label: "Convert Image Format", key: "convert" },
];

const TAGLINES = [
  "Your one-stop shop for quick file conversions and optimizations.",
  "Effortless Image Compression. Perfect Quality.",
  "Merge PDFs in a Snap. Simple and Secure.",
  "Convert Image Formats with a Single Click.",
];

const API_URL = "http://localhost:5001/api";

type BatchResult = {
  name: string;
  url: string;
  originalSize: number;
  compressedSize: number;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("compress");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isTaglineVisible, setIsTaglineVisible] = useState(true);
  const [fileInputs, setFileInputs] = useState<{
    compress: File[];
    merge: File[];
    convert: File | null;
  }>({
    compress: [],
    merge: [],
    convert: null,
  });
  const [result, setResult] = useState<string | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [convertFormat, setConvertFormat] = useState('png');
  const [targetSizeKB, setTargetSizeKB] = useState(500);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setIsTaglineVisible(false);
      setTimeout(() => {
        setTaglineIndex((prevIndex) => (prevIndex + 1) % TAGLINES.length);
        setIsTaglineVisible(true);
      }, 500);
    }, 5000);

    // Prevent default drag events on the whole page
    const preventDefaults = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const events: (keyof WindowEventMap)[] = ["dragenter", "dragover", "dragleave", "drop"];
    events.forEach(event => {
      window.addEventListener(event, preventDefaults as EventListener, false);
    });
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, preventDefaults as EventListener, false);
      });
    };
  }, []);

  const clearFileState = () => {
    setResult(null);
    setDownloadUrl(null);
    setFileName(null);
    setBatchResults([]);
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setImagePreviewUrls([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tab: string) => {
    clearFileState();
    const files = Array.from(e.target.files || []);
    
    if (tab === "compress") {
        setFileInputs((prev) => ({ ...prev, compress: files }));
        if (files.length > 0) {
            setFileName(`${files.length} image(s) selected`);
            const urls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(urls);
        }
    } else if (tab === "merge") {
      setFileInputs((prev) => ({ ...prev, merge: files }));
      if (files.length > 0) {
        setFileName(`${files.length} PDF(s) selected`);
      }
    } else if (tab === "convert") {
      const file = files[0] || null;
      setFileInputs((prev) => ({ ...prev, convert: file }));
      if (file) {
        setFileName(file.name);
        const url = URL.createObjectURL(file);
        setImagePreviewUrls([url]);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFileState();
    setLoading(true);

    if (activeTab === 'compress') {
      const promises = fileInputs.compress.map(async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("targetSizeKB", String(targetSizeKB));

        try {
          const res = await fetch(`${API_URL}/compress-image`, { method: "POST", body: formData });
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || `Failed for ${file.name}`);
          }
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          return {
            name: file.name,
            url,
            originalSize: file.size,
            compressedSize: blob.size,
          };
        } catch (error: any) {
          console.error(`Error processing ${file.name}:`, error);
          setResult(error.message || "Something went wrong");
          return null;
        }
      });

      const results = await Promise.all(promises);
      const successfulResults = results.filter(Boolean) as BatchResult[];
      setBatchResults(successfulResults);
      if (successfulResults.length > 0) {
        setResult(`${successfulResults.length} images compressed.`);
      }
    } else {
        // ... existing single-file logic for merge and convert
        try {
            let endpoint = "";
            const formData = new FormData();
             if (activeTab === "merge") {
                endpoint = `${API_URL}/merge-pdf`;
                if (!fileInputs.merge.length) throw new Error("No PDFs selected");
                fileInputs.merge.forEach((file) => formData.append("pdfs", file));
            } else if (activeTab === "convert") {
                endpoint = `${API_URL}/convert-image`;
                if (!fileInputs.convert) throw new Error("No image selected");
                formData.append("image", fileInputs.convert);
                formData.append("format", convertFormat);
            }

            const res = await fetch(endpoint, { method: "POST", body: formData });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Server error");
            }

            const contentType = res.headers.get("content-type");
            if (contentType && (contentType.includes("application/pdf") || contentType.startsWith("image/"))) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setDownloadUrl(url);
                setResult("Success! Click the link below to download your file.");
            } else {
                const data = await res.json();
                setResult(data.message || "Operation completed.");
            }
        } catch (err: any) {
            setResult(err.message || "Something went wrong");
        }
    }
    setLoading(false);
  };

  const formatTargetSize = (sizeInKB: number) => {
    if (sizeInKB >= 1000) {
      return `${(sizeInKB / 1000).toFixed(1)} MB`;
    }
    return `${sizeInKB} KB`;
  };

  const renderFormContent = () => {
    const commonInputProps = {
      className: styles.fileInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, activeTab),
      ref: fileInputRef,
    };
    const isImageTab = activeTab === 'compress' || activeTab === 'convert';
    const accept = isImageTab ? "image/*" : "application/pdf";
    const multiple = activeTab === 'compress' || activeTab === 'merge';

    // Drag-and-drop handlers for the label
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
    };
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      // Simulate file input change event
      if (fileInputRef.current) {
        // @ts-ignore
        fileInputRef.current.files = e.dataTransfer.files;
      }
      // Call the same handler as input
      handleFileChange({ target: { files: e.dataTransfer.files } } as any, activeTab);
    };

    return (
      <>
        <input
          key={activeTab}
          type="file"
          id="file-upload"
          accept={accept}
          multiple={multiple}
          {...commonInputProps}
        />
        {isImageTab && imagePreviewUrls.length > 0 ? (
          <div className={styles.imagePreviewGrid}>
            {imagePreviewUrls.map((url, index) => (
              <img key={index} src={url} alt={`Preview ${index + 1}`} className={styles.imagePreview} />
            ))}
          </div>
        ) : (
          <label
            htmlFor="file-upload"
            className={
              dragOver
                ? `${styles.fileInputLabel} ${styles.fileInputLabelDragOver}`
                : styles.fileInputLabel
            }
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fileName || "Click or drag file(s) to this area to upload"}
          </label>
        )}

        {activeTab === 'compress' && (
          <div className={styles.qualitySlider}>
            <label htmlFor="quality">Target Size: {targetSizeKB} KB</label>
            <input 
              type="range" 
              id="quality" 
              min="20" 
              max="5000"
              step="10"
              value={targetSizeKB} 
              onChange={(e) => setTargetSizeKB(Number(e.target.value))} 
            />
            <div className={styles.helperText}>
              <small>
                We&apos;ll do our best to compress your image under the selected size. Actual result may vary depending on image content and format.
              </small>
            </div>
          </div>
        )}

        {activeTab === 'convert' && (
          <div className={styles.formatSelector}>
            <label htmlFor="format">Convert to:</label>
            <select id="format" value={convertFormat} onChange={(e) => setConvertFormat(e.target.value)}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="gif">GIF</option>
            </select>
          </div>
        )}
      </>
    );
  };
  
  const getButtonText = () => {
    if (loading) {
      if (activeTab === 'compress') return 'Compressing Images...';
      if (activeTab === 'merge') return 'Merging...';
      if (activeTab === 'convert') return 'Converting...';
    }
    if (activeTab === 'compress') return 'Compress Images';
    if (activeTab === 'merge') return 'Merge PDFs';
    if (activeTab === 'convert') return 'Convert Image';
    return 'Submit';
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (activeTab === 'convert') return !fileInputs.convert;
    return (fileInputs[activeTab as 'compress' | 'merge']).length === 0;
  };

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <Image
            src="/ziply-logo.svg"
            alt="Ziply Logo"
            width={120}
            height={40}
            className={styles.logo}
            priority
          />
        </div>
        <div className={styles.themeSwitcherContainer}>
          <ThemeSwitcher />
        </div>
      </header>
      <main className={styles.main}>
        <div className={`${styles.tagline} ${isTaglineVisible ? styles.taglineVisible : ''}`}>
          {TAGLINES[taglineIndex]}
        </div>
        <div className={styles.tabContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                clearFileState();
              }}
              className={activeTab === tab.key ? styles.tabButtonActive : styles.tabButton}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {renderFormContent()}
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitDisabled()}
              >
                {getButtonText()}
              </button>
            </form>
        </div>

        {batchResults.length > 0 && (
            <div className={styles.resultsList}>
                <h3>Compression Results</h3>
                {batchResults.map((item, index) => (
                    <div key={index} className={styles.resultItem}>
                        <PhotoIcon className={styles.resultItemIcon} />
                        <span className={styles.resultItemName}>{item.name}</span>
                        <span className={styles.sizeInfo}>
                            {formatBytes(item.originalSize)} → <strong>{formatBytes(item.compressedSize)}</strong>
                        </span>
                        <a href={item.url} download={item.name} className={styles.downloadButton}>
                            <DocumentArrowDownIcon />
                            <span>Download</span>
                        </a>
                    </div>
                ))}
            </div>
        )}

        {result && downloadUrl && (
          <div className={result.startsWith("Success") ? styles.resultSuccess : styles.resultError}>
            {result}
            <a href={downloadUrl} download className={styles.downloadLink}>
              Download File
            </a>
          </div>
        )}
      </main>
      
    </div>
  );
}
