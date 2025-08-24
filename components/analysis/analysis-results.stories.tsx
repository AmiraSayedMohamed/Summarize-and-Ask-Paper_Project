import React from 'react'
import { AnalysisResults } from './analysis-results'

export default {
  title: 'Analysis/AnalysisResults',
  component: AnalysisResults,
}

const mockAnalysis = {
  authors: ['M. Wargon', 'B. Guidet', 'T. D. Hoang'],
  journal: 'Emerg Med J',
  publishedYear: 2009,
  doi: '10.1136/emj.2008.062380',
  citations: 123,
  summary:
    'This paper reviews models for forecasting emergency department visits. It compares regression and time-series models, reports performance, and discusses implications for staffing and resource planning.',
  keyFindings: [
    'Day of week is the strongest predictor of ED visits.',
    'Time-series and regression models explained 31–75% of variability in patient volume.',
    'Meteorological data did not substantially improve model performance in the reviewed studies.',
  ],
  methodology: [
    'Systematic review of Medline-indexed articles up to Sep 2007.',
    'Selection focused on studies predicting ED or walk-in clinic visits.',
    'Comparison of statistical approaches (regression, ARIMA).',
  ],
  researchGaps: [
    'Limited external validation across healthcare systems.',
    'Lack of standardized evaluation metrics across studies.',
  ],
  processedAt: new Date().toISOString(),
}

export const Default = () => <div style={{ padding: 20 }}><AnalysisResults analysis={mockAnalysis as any} /></div>
