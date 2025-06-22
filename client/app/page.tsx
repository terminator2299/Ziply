"use client";

// This file should be renamed to page.client.tsx to enable Client Component features.
import { useState } from "react";
import styles from "./page.module.css";

const TABS = [
  { label: "Compress Image", key: "compress" },
  { label: "Merge PDFs", key: "merge" },
  { label: "Convert Image Format", key: "convert" },
];

const API_URL = "http://localhost:5001/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState("compress");
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tab: string) => {
    setResult(null);
    setDownloadUrl(null);
    setFileName(null);
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

  const renderForm = () => {
    const commonInputProps = {
      className: styles.fileInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e, activeTab),
    };

    let inputKey: string | number = Date.now();
    let labelText = "Click or drag file to this area to upload";
    if (fileName) {
        labelText = fileName;
    }

    switch (activeTab) {
      case "compress":
        return {
          title: "Upload Image to Compress",
          input: <input type="file" id="file-upload" accept="image/*" {...commonInputProps} key={`${inputKey}-compress`} />,
          buttonText: loading ? "Compressing..." : "Compress Image",
          labelText: fileName ? `Selected: ${fileName}` : "Select image to compress",
        };
      case "merge":
        return {
          title: "Upload PDFs to Merge",
          input: <input type="file" id="file-upload" accept="application/pdf" multiple {...commonInputProps} key={`${inputKey}-merge`} />,
          buttonText: loading ? "Merging..." : "Merge PDFs",
          labelText: fileName ? `Selected: ${fileName}` : "Select PDFs to merge",
        };
      case "convert":
        return {
          title: "Upload Image to Convert",
          input: <input type="file" id="file-upload" accept="image/*" {...commonInputProps} key={`${inputKey}-convert`} />,
          buttonText: loading ? "Converting..." : "Convert Image",
          labelText: fileName ? `Selected: ${fileName}` : "Select image to convert",
          extra: (
            <div className={styles.formatSelector}>
              <label htmlFor="format">Convert to:</label>
              <select id="format" value={convertFormat} onChange={(e) => setConvertFormat(e.target.value)}>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
                <option value="gif">GIF</option>
              </select>
            </div>
          )
        };
      default:
        return null;
    }
  };

  const currentForm = renderForm();

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <span className={styles.brand}>Ziply</span>
      </header>
      <main className={styles.main}>
        <div className={styles.tagline}>
          Your one-stop shop for quick file conversions and optimizations.
        </div>
        <div className={styles.tabContainer}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setFileName(null);
                setResult(null);
                setDownloadUrl(null);
              }}
              className={activeTab === tab.key ? styles.tabButtonActive : styles.tabButton}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.formContainer}>
          {currentForm && (
            <form onSubmit={handleSubmit} className={styles.form}>
              <label htmlFor="file-upload" className={styles.fileInputLabel}>
                {currentForm.labelText}
              </label>
              {currentForm.input}
              {currentForm.extra}
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {currentForm.buttonText}
              </button>
            </form>
          )}
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
