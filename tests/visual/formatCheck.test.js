const puppeteer = require('puppeteer');
const { OpenAI } = require('openai');
const path = require('path');
const fs = require('fs');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

describe('Visual Format Testing', () => {
    let browser;
    let page;

    beforeAll(async () => {
        // Launch browser with extension
        browser = await puppeteer.launch({
            headless: false,
            args: [
                `--disable-extensions-except=${path.join(__dirname, '../..')}`,
                `--load-extension=${path.join(__dirname, '../..')}`
            ]
        });
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        page = await browser.newPage();
    });

    afterEach(async () => {
        await page.close();
    });

    async function analyzeScreenshot(imagePath) {
        const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
        
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this screenshot of an article page and tell me if: 1) The main content is centered, 2) There are no ads in the main content area, 3) The text is formatted in a paper-like style with proper margins and spacing. Respond with true/false for each criterion."
                        },
                        {
                            type: "image_url",
                            image_url: `data:image/png;base64,${base64Image}`
                        }
                    ]
                }
            ]
        });

        const analysis = response.choices[0].message.content;
        return {
            isCentered: analysis.toLowerCase().includes("1) true"),
            noAdsInContent: analysis.toLowerCase().includes("2) true"),
            properFormatting: analysis.toLowerCase().includes("3) true")
        };
    }

    test('NYTimes article should be properly formatted', async () => {
        await page.goto('https://www.nytimes.com/2024/12/04/technology/bitcoin-price-record.html');
        await page.waitForTimeout(2000); // Wait for extension to format
        
        const screenshotPath = path.join(__dirname, 'nyt-screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        const analysis = await analyzeScreenshot(screenshotPath);
        
        expect(analysis.isCentered).toBe(true);
        expect(analysis.noAdsInContent).toBe(true);
        expect(analysis.properFormatting).toBe(true);
        
        fs.unlinkSync(screenshotPath); // Clean up
    }, 30000);

    test('BBC article should be properly formatted', async () => {
        await page.goto('https://www.bbc.com/news/technology-68675654');
        await page.waitForTimeout(2000); // Wait for extension to format
        
        const screenshotPath = path.join(__dirname, 'bbc-screenshot.png');
        await page.screenshot({ path: screenshotPath, fullPage: true });
        
        const analysis = await analyzeScreenshot(screenshotPath);
        
        expect(analysis.isCentered).toBe(true);
        expect(analysis.noAdsInContent).toBe(true);
        expect(analysis.properFormatting).toBe(true);
        
        fs.unlinkSync(screenshotPath); // Clean up
    }, 30000);

    test('Media site should not be formatted', async () => {
        await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.waitForTimeout(2000);
        
        const screenshotPath = path.join(__dirname, 'youtube-screenshot.png');
        await page.screenshot({ path: screenshotPath });
        
        // For media sites, we expect the page to remain unchanged
        const analysis = await analyzeScreenshot(screenshotPath);
        
        // The content should NOT be centered in paper format
        expect(analysis.isCentered).toBe(false);
        expect(analysis.properFormatting).toBe(false);
        
        fs.unlinkSync(screenshotPath);
    }, 30000);
}); 