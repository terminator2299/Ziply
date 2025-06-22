"use client";

// This file should be renamed to page.client.tsx to enable Client Component features.
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { ThemeSwitcher } from "../components/ThemeSwitcher";

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

export default function Home() {
  const [activeTab, setActiveTab] = useState("compress");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isTaglineVisible, setIsTaglineVisible] = useState(true);
  const [fileInputs, setFileInputs] = useState<{
    compress: File | null;
    merge: File[];
    convert: File | null;
  }>({
    compress: null,
    merge: [],
    convert: null,
  });
  const [result, setResult] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [convertFormat, setConvertFormat] = useState('png');
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const taglineTimer = setInterval(() => {
      setIsTaglineVisible(false);
      setTimeout(() => {
        setTaglineIndex((prevIndex) => (prevIndex + 1) % TAGLINES.length);
        setIsTaglineVisible(true);
      }, 500); // Corresponds to the fade animation duration
    }, 5000); // Change tagline every 5 seconds

    return () => clearInterval(taglineTimer);
  }, []);

  const clearFileState = () => {
    setResult(null);
    setDownloadUrl(null);
    setFileName(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tab: string) => {
    clearFileState();

    if (tab === "merge") {
      const files = Array.from(e.target.files || []);
      setFileInputs((prev) => ({ ...prev, merge: files }));
      if (files.length > 0) {
        setFileName(`${files.length} PDF(s) selected`);
      }
    } else {
      const file = e.target.files?.[0] || null;
      setFileInputs((prev) => ({ ...prev, [tab]: file }));
      if (file) {
        setFileName(file.name);
        setImagePreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setDownloadUrl(null);
    setLoading(true);
    try {
      let endpoint = "";
      const formData = new FormData();
      if (activeTab === "compress") {
        endpoint = `${API_URL}/compress-image`;
        if (!fileInputs.compress) throw new Error("No image selected");
        formData.append("image", fileInputs.compress);
        formData.append("quality", String(compressionQuality));
      } else if (activeTab === "merge") {
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
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => {
    const commonInputProps = {
      className: styles.fileInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, activeTab),
    };
    
    const isImageTab = activeTab === 'compress' || activeTab === 'convert';

    return (
      <>
        <input 
          key={activeTab}
          type="file" 
          id="file-upload"
          accept={isImageTab ? "image/*" : "application/pdf"}
          multiple={activeTab === 'merge'}
          {...commonInputProps} 
        />
        
        {isImageTab && imagePreviewUrl ? (
          <div className={styles.imagePreviewContainer}>
            <img src={imagePreviewUrl} alt="Selected preview" className={styles.imagePreview} />
          </div>
        ) : (
          <label htmlFor="file-upload" className={styles.fileInputLabel}>
            {fileName || "Click or drag file to this area to upload"}
          </label>
        )}

        {activeTab === 'compress' && (
          <div className={styles.qualitySlider}>
            <label htmlFor="quality">Compression Quality: {compressionQuality}</label>
            <input type="range" id="quality" min="1" max="100" value={compressionQuality} onChange={(e) => setCompressionQuality(Number(e.target.value))} />
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
      if (activeTab === 'compress') return 'Compressing...';
      if (activeTab === 'merge') return 'Merging...';
      if (activeTab === 'convert') return 'Converting...';
    }
    if (activeTab === 'compress') return 'Compress Image';
    if (activeTab === 'merge') return 'Merge PDFs';
    if (activeTab === 'convert') return 'Convert Image';
    return 'Submit';
  }

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.brand}>Ziply</span>
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
              <button type="submit" className={styles.submitButton} disabled={loading || !fileName}>
                {getButtonText()}
              </button>
            </form>
        </div>

        {result && (
          <div className={result.startsWith("Success") ? styles.resultSuccess : styles.resultError}>
            {result}
            {downloadUrl && (
              <a href={downloadUrl} download className={styles.downloadLink}>
                Download File
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
