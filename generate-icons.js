const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate simple HTML files with emoji for each icon size
const sizes = [16, 48, 128];
const emoji = '🦁';

// Function to create icon HTML which can be captured as an image
sizes.forEach(size => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Lion Icon ${size}px</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5d76e;
      border-radius: ${size * 0.2}px;
      overflow: hidden;
    }
    .emoji {
      font-size: ${size * 0.7}px;
      line-height: 1;
    }
  </style>
</head>
<body>
  <div class="emoji">${emoji}</div>
</body>
</html>
  `;

  fs.writeFileSync(path.join(assetsDir, `icon${size}.html`), htmlContent);
  console.log(`Created HTML template for icon${size}.html`);
});

console.log('\nInstructions:');
console.log('1. Open each HTML file in your browser');
console.log('2. Take a screenshot of each (make sure it\'s exactly the right size)');
console.log('3. Save screenshots as icon16.png, icon48.png, and icon128.png in the assets directory');
console.log('\nAlternatively, you can use a tool like ImageMagick to convert these to PNG files.');
