// Popup script for Boko Vulnerability Detector

document.addEventListener('DOMContentLoaded', () => {
  // Get UI elements
  const scanButton = document.getElementById('scanButton');
  const passiveScan = document.getElementById('passiveScan');
  const activeScan = document.getElementById('activeScan');
  const aiAnalysis = document.getElementById('aiAnalysis');
  const scanSummary = document.getElementById('scanSummary');
  const vulnList = document.getElementById('vulnList');
  
  // Set event listeners
  scanButton.addEventListener('click', startScan);
  
  // Scan the current page
  async function startScan() {
    // Update UI to show scan is in progress
    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';
    scanSummary.textContent = 'Scan in progress...';
    vulnList.innerHTML = '';
    
    try {
      // Get current active tab
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      
      // Get scan options
      const options = {
        passiveScan: passiveScan.checked,
        activeScan: activeScan.checked,
        aiAnalysis: aiAnalysis.checked
      };
      
      // Send message to content script to start scanning
      const response = await browser.tabs.sendMessage(activeTab.id, {
        action: 'scanPage',
        options
      });
      
      // Handle scan results
      if (response && response.success) {
        displayResults(response.results);
      } else {
        scanSummary.textContent = 'Scan failed. Please try again.';
      }
    } catch (error) {
      console.error('Scan error:', error);
      scanSummary.textContent = `Error: ${error.message}`;
    } finally {
      // Reset button state
      scanButton.disabled = false;
      scanButton.textContent = 'Scan This Page';
    }
  }
  
  // Display scan results in the UI
  function displayResults(results) {
    // Update summary section
    const { summary } = results;
    
    scanSummary.innerHTML = `
      <div class="summary-counts">
        <div class="count critical">${summary.critical || 0}</div>
        <div class="count high">${summary.high || 0}</div>
        <div class="count medium">${summary.medium || 0}</div>
        <div class="count low">${summary.low || 0}</div>
      </div>
      <div class="summary-labels">
        <div>Critical</div>
        <div>High</div>
        <div>Medium</div>
        <div>Low</div>
      </div>
      <div class="total-issues">
        Total issues found: ${summary.total || 0}
      </div>
    `;
    
    // No vulnerabilities found
    if (summary.total === 0) {
      vulnList.innerHTML = '<div class="no-vulns">No vulnerabilities detected!</div>';
      return;
    }
    
    // Display vulnerabilities
    vulnList.innerHTML = '';
    results.vulnerabilities.forEach(vuln => {
      const vulnElement = document.createElement('div');
      vulnElement.className = `vulnerability ${vuln.severity.toLowerCase()}`;
      
      vulnElement.innerHTML = `
        <div class="vuln-header">
          <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
          <h3>${vuln.name}</h3>
        </div>
        <div class="vuln-details">
          <p>${vuln.description}</p>
          <div class="location"><strong>Location:</strong> ${vuln.location}</div>
          ${vuln.element ? `<div class="element"><strong>Element:</strong> <code>${vuln.element}</code></div>` : ''}
          <div class="remediation"><strong>Remediation:</strong> ${vuln.remediation}</div>
        </div>
      `;
      
      // Add collapsible behavior
      const header = vulnElement.querySelector('.vuln-header');
      const details = vulnElement.querySelector('.vuln-details');
      
      header.addEventListener('click', () => {
        vulnElement.classList.toggle('expanded');
      });
      
      vulnList.appendChild(vulnElement);
    });
  }
});
