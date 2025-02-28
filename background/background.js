// Background script for Boko Vulnerability Detector

// Store results between popup reopens
let scanResults = null;

// Listen for messages from content script or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'storeScanResults') {
    // Store scan results for later retrieval
    scanResults = message.results;
    return Promise.resolve({ success: true });
  }
  
  if (message.action === 'getScanResults') {
    // Return stored scan results
    return Promise.resolve({ results: scanResults });
  }
  
  if (message.action === 'checkSecurityHeaders') {
    // This would fetch security headers in a real implementation
    // For MVP, we'll return a sample response
    return Promise.resolve({
      headers: {
        'Content-Security-Policy': null,
        'X-Frame-Options': null,
        'X-XSS-Protection': null
      }
    });
  }
});

// Add browser action badge when vulnerabilities are detected
function updateBadge(count) {
  if (count > 0) {
    browser.browserAction.setBadgeText({ text: count.toString() });
    browser.browserAction.setBadgeBackgroundColor({ color: count > 5 ? '#e74c3c' : '#f39c12' });
  } else {
    browser.browserAction.setBadgeText({ text: '' });
  }
}

// Initialize when extension is installed
browser.runtime.onInstalled.addListener(() => {
  console.log('Boko Vulnerability Detector installed');
});
