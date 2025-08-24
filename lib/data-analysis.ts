export interface DataAnalysisRequest {
  id: string
  fileName: string
  analysisType: "descriptive" | "correlation" | "regression" | "clustering" | "hypothesis-test"
  description: string
  columns: string[]
  targetColumn?: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: Date
}

export interface AnalysisResult {
  id: string
  requestId: string
  pythonCode: string
  summary: string
  insights: string[]
  visualizations: ChartData[]
  statisticalTests?: StatisticalTest[]
  academicInterpretation: string
  recommendations: string[]
}

export interface ChartData {
  id: string
  type: "bar" | "line" | "scatter" | "histogram" | "box" | "heatmap"
  title: string
  data: any[]
  xAxis: string
  yAxis: string
  description: string
}

export interface StatisticalTest {
  name: string
  statistic: number
  pValue: number
  significance: boolean
  interpretation: string
}

// Mock data analysis functions
export const analyzeData = async (request: DataAnalysisRequest): Promise<AnalysisResult> => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const mockChartData: ChartData[] = [
    {
      id: "1",
      type: "bar",
      title: "Distribution by Category",
      data: [
        { name: "Category A", value: 45, count: 120 },
        { name: "Category B", value: 32, count: 85 },
        { name: "Category C", value: 28, count: 75 },
        { name: "Category D", value: 15, count: 40 },
      ],
      xAxis: "name",
      yAxis: "value",
      description: "Shows the distribution of values across different categories",
    },
    {
      id: "2",
      type: "line",
      title: "Trend Over Time",
      data: [
        { month: "Jan", value: 65, trend: 62 },
        { month: "Feb", value: 72, trend: 68 },
        { month: "Mar", value: 78, trend: 74 },
        { month: "Apr", value: 85, trend: 80 },
        { month: "May", value: 92, trend: 86 },
        { month: "Jun", value: 88, trend: 90 },
      ],
      xAxis: "month",
      yAxis: "value",
      description: "Temporal analysis showing trends and patterns over time",
    },
    {
      id: "3",
      type: "scatter",
      title: "Correlation Analysis",
      data: [
        { x: 23, y: 45, category: "Group 1" },
        { x: 34, y: 52, category: "Group 1" },
        { x: 45, y: 61, category: "Group 2" },
        { x: 56, y: 68, category: "Group 2" },
        { x: 67, y: 75, category: "Group 3" },
        { x: 78, y: 82, category: "Group 3" },
      ],
      xAxis: "x",
      yAxis: "y",
      description: "Scatter plot showing relationship between two variables",
    },
  ]

  const mockStatTests: StatisticalTest[] = [
    {
      name: "Pearson Correlation",
      statistic: 0.847,
      pValue: 0.001,
      significance: true,
      interpretation: "Strong positive correlation found between variables (r=0.847, p<0.001)",
    },
    {
      name: "T-Test",
      statistic: 3.24,
      pValue: 0.012,
      significance: true,
      interpretation: "Significant difference between groups (t=3.24, p=0.012)",
    },
  ]

  return {
    id: `result_${Date.now()}`,
    requestId: request.id,
    pythonCode: `import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats

# Load and examine the data
df = pd.read_csv('${request.fileName}')
print("Dataset shape:", df.shape)
print("\\nDataset info:")
print(df.info())

# Descriptive statistics
print("\\nDescriptive Statistics:")
print(df.describe())

# Correlation analysis
correlation_matrix = df.corr()
print("\\nCorrelation Matrix:")
print(correlation_matrix)

# Statistical tests
${
  request.analysisType === "correlation"
    ? `
# Pearson correlation test
corr_coef, p_value = stats.pearsonr(df['${request.columns[0]}'], df['${request.columns[1] || request.columns[0]}'])
print(f"Correlation coefficient: {corr_coef:.3f}")
print(f"P-value: {p_value:.3f}")
`
    : ""
}

${
  request.analysisType === "hypothesis-test"
    ? `
# Independent t-test
group1 = df[df['group'] == 'A']['${request.targetColumn || request.columns[0]}']
group2 = df[df['group'] == 'B']['${request.targetColumn || request.columns[0]}']
t_stat, p_value = stats.ttest_ind(group1, group2)
print(f"T-statistic: {t_stat:.3f}")
print(f"P-value: {p_value:.3f}")
`
    : ""
}

# Visualizations
plt.figure(figsize=(12, 8))

# Distribution plot
plt.subplot(2, 2, 1)
df['${request.columns[0]}'].hist(bins=20, alpha=0.7)
plt.title('Distribution of ${request.columns[0]}')
plt.xlabel('${request.columns[0]}')
plt.ylabel('Frequency')

# Box plot
plt.subplot(2, 2, 2)
df.boxplot(column='${request.columns[0]}')
plt.title('Box Plot of ${request.columns[0]}')

# Correlation heatmap
plt.subplot(2, 2, 3)
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0)
plt.title('Correlation Heatmap')

# Scatter plot (if applicable)
plt.subplot(2, 2, 4)
if len(df.columns) >= 2:
    plt.scatter(df['${request.columns[0]}'], df['${request.columns[1] || request.columns[0]}'], alpha=0.6)
    plt.xlabel('${request.columns[0]}')
    plt.ylabel('${request.columns[1] || request.columns[0]}')
    plt.title('Scatter Plot')

plt.tight_layout()
plt.show()

# Export results
results_summary = {
    'dataset_shape': df.shape,
    'missing_values': df.isnull().sum().to_dict(),
    'descriptive_stats': df.describe().to_dict(),
    'correlation_matrix': correlation_matrix.to_dict()
}

print("\\nAnalysis completed successfully!")`,
    summary: `Analysis of ${request.fileName} completed successfully. The dataset contains ${mockChartData[0].data.length} observations across ${request.columns.length} variables. Key findings include strong correlations between variables and significant statistical relationships.`,
    insights: [
      "Strong positive correlation (r=0.847) found between primary variables",
      "Significant group differences detected (p<0.05)",
      "Data shows normal distribution with minimal outliers",
      "Temporal trends indicate consistent growth pattern",
      "Clustering analysis reveals 3 distinct data groups",
    ],
    visualizations: mockChartData,
    statisticalTests: mockStatTests,
    academicInterpretation: `The statistical analysis reveals several significant findings that contribute to our understanding of the underlying data patterns. The strong positive correlation (r = 0.847, p < 0.001) between the primary variables suggests a robust linear relationship, indicating that changes in one variable are consistently associated with proportional changes in the other. This finding is statistically significant and exceeds the conventional threshold for strong correlations in social science research.

Furthermore, the independent samples t-test demonstrates significant differences between experimental groups (t = 3.24, p = 0.012), providing evidence for the hypothesized effect. The effect size, while moderate, suggests practical significance beyond statistical significance. The distribution analysis confirms that the data meets the assumptions for parametric testing, with approximately normal distributions and homogeneous variances across groups.

These results have important implications for theoretical understanding and practical applications. The identified patterns suggest that the relationship between variables is not merely correlational but may indicate underlying causal mechanisms that warrant further investigation through experimental designs.`,
    recommendations: [
      "Consider expanding the sample size to increase statistical power",
      "Implement longitudinal design to establish temporal relationships",
      "Control for potential confounding variables in future studies",
      "Validate findings through replication with independent datasets",
      "Explore non-linear relationships using advanced modeling techniques",
    ],
  }
}

export const getAnalysisHistory = async (): Promise<DataAnalysisRequest[]> => {
  await new Promise((resolve) => setTimeout(resolve, 300))

  return [
    {
      id: "1",
      fileName: "survey_data.csv",
      analysisType: "correlation",
      description: "Correlation analysis between satisfaction scores and performance metrics",
      columns: ["satisfaction", "performance", "engagement"],
      targetColumn: "satisfaction",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: "2",
      fileName: "experiment_results.csv",
      analysisType: "hypothesis-test",
      description: "T-test comparing control and treatment groups",
      columns: ["group", "outcome", "baseline"],
      targetColumn: "outcome",
      status: "completed",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: "3",
      fileName: "longitudinal_study.csv",
      analysisType: "regression",
      description: "Multiple regression analysis of predictive factors",
      columns: ["time", "factor1", "factor2", "outcome"],
      targetColumn: "outcome",
      status: "processing",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  ]
}
