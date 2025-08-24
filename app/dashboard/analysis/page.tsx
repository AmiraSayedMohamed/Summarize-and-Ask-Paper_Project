"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataUpload } from "@/components/analysis/data-upload"
import { VisualizationCharts } from "@/components/analysis/visualization-charts"
import { type DataAnalysisRequest, type AnalysisResult, analyzeData, getAnalysisHistory } from "@/lib/data-analysis"
import { formatDistanceToNow } from "date-fns"
import {
  BarChart3,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Code,
  Brain,
  TrendingUp,
} from "lucide-react"
import { useEffect } from "react"

export default function DataAnalysisPage() {
  const [currentAnalysis, setCurrentAnalysis] = useState<DataAnalysisRequest | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [analysisHistory, setAnalysisHistory] = useState<DataAnalysisRequest[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      const history = await getAnalysisHistory()
      setAnalysisHistory(history)
    }
    fetchHistory()
  }, [])

  const handleAnalysisStart = async (request: DataAnalysisRequest) => {
    setCurrentAnalysis(request)
    setAnalysisResult(null)
    setLoading(true)

    try {
      const result = await analyzeData(request)
      setAnalysisResult(result)
      setAnalysisHistory((prev) => [request, ...prev])
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Analysis</h1>
        <p className="text-muted-foreground">Upload your datasets and generate statistical analysis with Python code</p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">Analysis History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <DataUpload onAnalysisStart={handleAnalysisStart} />

          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Analyzing your data and generating Python code...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {analysisResult ? (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{analysisResult.summary}</p>
                  <div className="space-y-2">
                    <h4 className="font-medium">Key Insights:</h4>
                    <ul className="space-y-1">
                      {analysisResult.insights.map((insight, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Visualizations */}
              <VisualizationCharts charts={analysisResult.visualizations} />

              {/* Statistical Tests */}
              {analysisResult.statisticalTests && (
                <Card>
                  <CardHeader>
                    <CardTitle>Statistical Tests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.statisticalTests.map((test, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{test.name}</h4>
                            <Badge
                              className={
                                test.significance ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              }
                            >
                              {test.significance ? "Significant" : "Not Significant"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <span className="text-muted-foreground">Statistic: </span>
                              <span className="font-mono">{test.statistic.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">P-value: </span>
                              <span className="font-mono">{test.pValue.toFixed(3)}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{test.interpretation}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Python Code */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Generated Python Code
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download Code
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{analysisResult.pythonCode}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Academic Interpretation */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Interpretation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">{analysisResult.academicInterpretation}</p>
                  </div>
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Recommendations for Future Research:</h4>
                    <ul className="space-y-1">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          • {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No analysis results yet</p>
                  <p className="text-sm text-muted-foreground">Upload a dataset to get started</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisHistory.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{analysis.fileName}</div>
                        <div className="text-sm text-muted-foreground">{analysis.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(analysis.createdAt)} ago • {analysis.analysisType}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(analysis.status)}>
                        {getStatusIcon(analysis.status)}
                        <span className="ml-1">{analysis.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Results
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
