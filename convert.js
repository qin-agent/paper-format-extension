const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { JSDOM } = require('jsdom');
const svg2img = require('svg2img');

// Convert SVG to PNG
function convertSvgToPng(svgPath, pngPath, width, height) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    svg2img(svgContent, {
        width: width,
        height: height
    }, function(error, buffer) {
        if (error) {
            console.error(`Error converting ${svgPath}:`, error);
            return;
        }
        fs.writeFileSync(pngPath, buffer);
        console.log(`Converted ${svgPath} to ${pngPath}`);
    });
}

// Convert both icons
convertSvgToPng('icon48.svg', 'icon48.png', 48, 48);
convertSvgToPng('icon128.svg', 'icon128.png', 128, 128); 