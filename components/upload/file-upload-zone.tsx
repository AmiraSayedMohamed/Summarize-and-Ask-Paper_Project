"use client";
import { useCallback, useState } from "react";
import { useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { validateFile, uploadFile } from "@/lib/file-processing";
import { addFileToProject } from "@/lib/projects";
import type { UploadedFile } from "@/lib/types";

interface FileUploadZoneProps {
  projectId: string;
  onFileUploaded?: (file: UploadedFile) => void;
}
interface FileUploadState {

  file: File;
  uploadedFile?: UploadedFile;
  progress: number;
  status: "uploading" | "processing" | "completed" | "failed";
  error?: string;
}
// Add the actual FileUploadZone component export here
export function FileUploadZone({ projectId, onFileUploaded }: FileUploadZoneProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [error, setError] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");
      setAnalysisResult(null);
      setAnalyzing(true);
      // Simulate upload for all files
      let uploadedFiles: UploadedFile[] = [];
          for (const file of acceptedFiles) {
        const validation = validateFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          continue;
        }
        const uploadState: FileUploadState = {
          file,
          progress: 0,
          status: "uploading",
        };
        setUploads((prev) => [...prev, uploadState]);
        try {
          const uploadedFile = await uploadFile(file, projectId);
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, uploadedFile, progress: 100, status: "processing" } : u)),
          );
          await addFileToProject(uploadedFile);
          const uploadedEntry = { ...uploadedFile, status: "completed" };
          // push and notify parent; cast to UploadedFile to satisfy TS type narrowing
          uploadedFiles.push(uploadedEntry as UploadedFile);
          try {
            if (onFileUploaded) onFileUploaded(uploadedEntry as UploadedFile);
          } catch (e) {
            // ignore notification errors
          }
        } catch (err: any) {
          setUploads((prev) =>
            prev.map((u) => (u.file === file ? { ...u, status: "failed", error: err.message } : u)),
          );
          setError((err as Error).message || "Upload or analysis failed");
        }
      }
      // Start background analysis job
      if (uploadedFiles.length > 0) {
        const filesForJob: { [id: string]: string } = {};
        uploadedFiles.forEach(f => filesForJob[f.id] = f.url || "");
        const response = await fetch("http://localhost:8000/start-analysis-job/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: filesForJob, links: [], user_query: null }),
        });
        const data = await response.json();
        setJobId(data.job_id);
        setJobStatus("pending");
      }
    },
    [projectId, onFileUploaded],
  );

  // Poll job status
  useEffect(() => {
    if (!jobId) return;
    setJobStatus("pending");
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`http://localhost:8000/job-status/${jobId}`);
      const data = await res.json();
      setJobStatus(data.status);
      if (data.status === "completed") {
        // store the whole result object so we can render structured summaries
        setAnalysisResult(data.result || data.result?.answer || data.result?.text || null);
        setAnalyzing(false);
        clearInterval(pollingRef.current!);
      } else if (data.status === "failed") {
        setError(data.error || "Analysis failed");
        setAnalyzing(false);
        clearInterval(pollingRef.current!);
      }
    }, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [jobId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const removeUpload = (file: File) => {
    setUploads((prev) => prev.filter((u) => u.file !== file));
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{isDragActive ? "Drop files here" : "Upload Research Papers"}</h3>
        <p className="text-muted-foreground mb-4">Drag and drop PDF files here, or click to browse</p>
        <Button variant="outline">Choose Files</Button>
        <p className="text-xs text-muted-foreground mt-2">PDF files only, max 50MB each</p>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Uploading Files</h4>
          {uploads.map((upload, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center space-x-4">
                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{upload.file.name}</p>
                  <p className="text-sm text-muted-foreground">{(upload.file.size / 1024 / 1024).toFixed(1)} MB</p>
                  {upload.status === "uploading" && (
                    <div className="mt-2">
                      <Progress value={upload.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Uploading... {upload.progress}%</p>
                    </div>
                  )}
                  {upload.status === "processing" && (
                    <div className="mt-2">
                      <Progress value={33} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">Processing with AI...</p>
                    </div>
                  )}
                  {upload.status === "completed" && (
                    <div className="flex items-center mt-2">
                      <CheckCircle className="h-4 w-4 text-secondary mr-1" />
                      <p className="text-xs text-secondary">Analysis completed</p>
                    </div>
                  )}
                  {upload.status === "failed" && (
                    <div className="flex items-center mt-2">
                      <AlertCircle className="h-4 w-4 text-destructive mr-1" />
                      <p className="text-xs text-destructive">{upload.error || "Upload failed"}</p>
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm" onClick={() => removeUpload(upload.file)} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {analyzing && (
        <div className="mt-4 text-center text-muted-foreground">
          <span className="animate-spin inline-block mr-2">🔄</span>
          {jobStatus === "pending" || jobStatus === "running"
            ? "Analyzing PDF with AI... (this may take a minute)"
            : "Preparing analysis..."}
        </div>
      )}
      {analysisResult && (
        <Card className="mt-4 p-4">
          <div className="font-bold mb-2">AI Analysis Result</div>
          {/* If analysisResult is an object with structured fields, render them */}
          {typeof analysisResult === 'object' && (
            <div className="text-sm mt-2 space-y-2">
              {analysisResult.title && (
                <div>
                  <div className="text-xs text-gray-500">Title</div>
                  <div className="font-medium">{analysisResult.title}</div>
                </div>
              )}
              {analysisResult.authors && (
                <div>
                  <div className="text-xs text-gray-500">Authors</div>
                  <div>{analysisResult.authors}</div>
                </div>
              )}
              {analysisResult.one_line_summary && (
                <div>
                  <div className="text-xs text-gray-500">Summary</div>
                  <div>{analysisResult.one_line_summary}</div>
                </div>
              )}
              {analysisResult.abstract_excerpt && (
                <div>
                  <div className="text-xs text-gray-500">Abstract (excerpt)</div>
                  <div className="text-sm text-gray-700">{analysisResult.abstract_excerpt}</div>
                </div>
              )}
              {analysisResult.methods_excerpt && (
                <div>
                  <div className="text-xs text-gray-500">Methods (excerpt)</div>
                  <div className="text-sm text-gray-700">{analysisResult.methods_excerpt}</div>
                </div>
              )}
              {analysisResult.findings_excerpt && (
                <div>
                  <div className="text-xs text-gray-500">Findings (excerpt)</div>
                  <div className="text-sm text-gray-700">{analysisResult.findings_excerpt}</div>
                </div>
              )}
              {analysisResult.link && (
                <div>
                  <div className="text-xs text-gray-500">Link</div>
                  <a className="text-indigo-600 underline" href={analysisResult.link} target="_blank" rel="noreferrer">Open paper</a>
                </div>
              )}
              {/* If summaries array exists, show short per-citation summaries */}
              {analysisResult.summaries && Array.isArray(analysisResult.summaries) && (
                <div>
                  <div className="text-xs text-gray-500">Per-citation summaries</div>
                  <ul className="list-disc pl-5 text-sm">
                    {analysisResult.summaries.map((s: any, i: number) => (
                      <li key={i}>
                        <div className="font-medium">{s.title || s.short || `Citation ${i+1}`}</div>
                        {s.snippet && <div className="text-gray-700 text-sm">{s.snippet}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Raw fallback */}
              {analysisResult.text && (
                <div>
                  <div className="text-xs text-gray-500">Full extracted text / analysis</div>
                  <pre className="whitespace-pre-wrap text-sm mt-1">{analysisResult.text}</pre>
                </div>
              )}
            </div>
          )}
          {/* If it's just a string, show it directly */}
          {typeof analysisResult !== 'object' && (
            <pre className="whitespace-pre-wrap text-sm mt-2">{String(analysisResult)}</pre>
          )}
        </Card>
      )}
    </div>
  );
}
