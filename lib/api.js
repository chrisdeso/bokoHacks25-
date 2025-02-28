// API module for Claude integration
import API_KEYS from '../config/keys.js';

export class ClaudeAPI {
  constructor() {
    this.apiKey = API_KEYS.CLAUDE_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = 'claude-3-opus-20240229'; // Or whichever Claude model you're using
  }

  /**
   * Analyzes HTML for security vulnerabilities using Claude
   * @param {string} html - The HTML content to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeHtml(html) {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'user',
              content: `Analyze this HTML for potential security vulnerabilities. 
              Focus on XSS, CSRF, insecure forms, and any other security issues.
              Provide a structured response with vulnerability name, description, 
              severity (Critical, High, Medium, Low), and recommended fix.
              
              HTML:
              ${html.substring(0, 15000)}` // Limit size to avoid token limits
            }
          ],
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseClaudeResponse(data);
    } catch (error) {
      console.error('Claude API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse Claude's response into the extension's vulnerability format
   * @param {Object} response - Response from Claude API
   * @returns {Array} Formatted vulnerabilities
   */
  parseClaudeResponse(response) {
    try {
      // Extract content from Claude response
      const content = response.content[0].text;
      
      // For the MVP, we'll do a simple parsing
      // In production, you'd want more robust parsing using regex or structured output
      
      const vulnerabilities = [];
      
      // Example pattern: extract blocks that look like vulnerability descriptions
      const sections = content.split(/#{2,3}\s+/); // Split on markdown headers
      
      for (let i = 1; i < sections.length; i++) { // Skip first element which is usually intro
        const section = sections[i].trim();
        const lines = section.split('\n');
        
        // Simple extraction (would need to be more robust in production)
        const name = lines[0].trim();
        let description = '';
        let severity = 'Medium'; // Default
        let remediation = '';
        
        for (let j = 1; j < lines.length; j++) {
          const line = lines[j].trim();
          
          if (line.startsWith('Severity:')) {
            severity = line.replace('Severity:', '').trim();
          } else if (line.startsWith('Description:')) {
            description = line.replace('Description:', '').trim();
          } else if (line.startsWith('Remediation:') || line.startsWith('Fix:')) {
            remediation = line.replace(/Remediation:|Fix:/, '').trim();
          } else if (description && !remediation) {
            // Append to description if we've started a description but not yet reached remediation
            description += ' ' + line;
          } else if (remediation) {
            // Append to remediation if we've already started that section
            remediation += ' ' + line;
          }
        }
        
        // Only add if we have at least a name and description
        if (name && description) {
          vulnerabilities.push({
            id: `claude-${i}`,
            name,
            description,
            severity: this.normalizeSeverity(severity),
            location: 'AI Analysis',
            remediation: remediation || 'Not provided'
          });
        }
      }
      
      return {
        success: true,
        vulnerabilities
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error);
      return {
        success: false,
        error: 'Failed to parse AI response',
        vulnerabilities: []
      };
    }
  }
  
  /**
   * Normalize severity ratings to match our standard levels
   */
  normalizeSeverity(severity) {
    severity = severity.toLowerCase();
    
    if (severity.includes('critical')) return 'Critical';
    if (severity.includes('high')) return 'High';
    if (severity.includes('medium') || severity.includes('moderate')) return 'Medium';
    if (severity.includes('low')) return 'Low';
    
    return 'Medium'; // Default
  }
}
