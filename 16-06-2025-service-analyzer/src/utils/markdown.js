const fs = require('fs');
const path = require('path');

/**
 * Convert a service analysis to markdown format
 * @param {Object} analysis The service analysis object
 * @param {string} originalPrompt The original user input prompt
 * @returns {string} Markdown content as a string
 */
function generateMarkdown(analysis, originalPrompt) {
  return `# ${analysis.serviceName} - Service Analysis

## Original Prompt
${originalPrompt}

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
 * @param {string} content Markdown content
 * @param {string} serviceName Service name for file naming
 * @returns {string} Path to the saved file
 */
function saveMarkdown(content, serviceName) {
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

module.exports = {
  generateMarkdown,
  saveMarkdown
}; 