import * as fs from 'fs';
import * as path from 'path';
import { ServiceAnalysis } from '../types';

/**
 * Convert a service analysis to markdown format
 * @param analysis The service analysis object
 * @returns Markdown content as a string
 */
export function generateMarkdown(analysis: ServiceAnalysis): string {
  return `# ${analysis.serviceName} - Service Analysis

## Brief History
${analysis.briefHistory}

## Target Audience
${analysis.targetAudience}

## Core Features
${analysis.coreFeatures}

## Unique Selling Points
${analysis.uniqueSellingPoints}

## Business Model
${analysis.businessModel}

## Tech Stack Insights
${analysis.techStackInsights}

## Perceived Strengths
${analysis.perceivedStrengths}

## Perceived Weaknesses
${analysis.perceivedWeaknesses}
`;
}

/**
 * Save markdown content to a file
 * @param content Markdown content
 * @param serviceName Service name for file naming
 * @returns Path to the saved file
 */
export function saveMarkdown(content: string, serviceName: string): string {
  // Create output directory if it doesn't exist
  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  // Generate safe filename
  const fileName = `${serviceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-analysis.md`;
  const filePath = path.join(outputDir, fileName);
  
  // Write file
  fs.writeFileSync(filePath, content);
  
  return filePath;
} 