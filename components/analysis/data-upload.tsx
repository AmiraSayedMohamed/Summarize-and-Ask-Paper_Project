"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react"
import type { DataAnalysisRequest } from "@/lib/data-analysis"

interface DataUploadProps {
  onAnalysisStart: (request: DataAnalysisRequest) => void
}

export function DataUpload({ onAnalysisStart }: DataUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>("")
  const [description, setDescription] = useState("")
  const [columns, setColumns] = useState<string[]>([])
  const [targetColumn, setTargetColumn] = useState("")
  const [dragActive, setDragActive] = useState(false)

  // Mock column detection from CSV
  const mockColumns = ["id", "age", "gender", "score", "category", "timestamp", "value"]

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type === "text/csv" || droppedFile.name.endsWith(".csv")) {
        setFile(droppedFile)
        setColumns(mockColumns) // In real app, would parse CSV headers
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setColumns(mockColumns) // In real app, would parse CSV headers
      }
    }
  }

  const removeColumn = (columnToRemove: string) => {
    setColumns(columns.filter((col) => col !== columnToRemove))
  }

  const handleSubmit = () => {
    if (!file || !analysisType || !description) return

    const request: DataAnalysisRequest = {
      id: `analysis_${Date.now()}`,
      fileName: file.name,
      analysisType: analysisType as any,
      description,
      columns,
      targetColumn: targetColumn || undefined,
      status: "pending",
      createdAt: new Date(),
    }

    onAnalysisStart(request)
  }

  const isValid = file && analysisType && description && columns.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Data for Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Dataset File (CSV)</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{file.name}</p>
                  <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Drop your CSV file here</p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                </div>
              </div>
            )}
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Analysis Type */}
        <div className="space-y-2">
          <Label>Analysis Type</Label>
          <Select value={analysisType} onValueChange={setAnalysisType}>
            <SelectTrigger>
              <SelectValue placeholder="Select analysis type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="descriptive">Descriptive Statistics</SelectItem>
              <SelectItem value="correlation">Correlation Analysis</SelectItem>
              <SelectItem value="regression">Regression Analysis</SelectItem>
              <SelectItem value="hypothesis-test">Hypothesis Testing</SelectItem>
              <SelectItem value="clustering">Clustering Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label>Analysis Description</Label>
          <Textarea
            placeholder="Describe what you want to analyze and your research questions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Columns */}
        {columns.length > 0 && (
          <div className="space-y-2">
            <Label>Available Columns</Label>
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <Badge key={column} variant="secondary" className="flex items-center gap-1">
                  {column}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeColumn(column)} />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Target Column */}
        {(analysisType === "regression" || analysisType === "hypothesis-test") && columns.length > 0 && (
          <div className="space-y-2">
            <Label>Target Variable</Label>
            <Select value={targetColumn} onValueChange={setTargetColumn}>
              <SelectTrigger>
                <SelectValue placeholder="Select target column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((column) => (
                  <SelectItem key={column} value={column}>
                    {column}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit */}
        <Button onClick={handleSubmit} disabled={!isValid} className="w-full" size="lg">
          Start Analysis
        </Button>
      </CardContent>
    </Card>
  )
}
