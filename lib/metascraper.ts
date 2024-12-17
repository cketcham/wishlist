import metascraper from 'metascraper';
import metascraperDescription from 'metascraper-description';
import metascraperTitle from 'metascraper-title';
import metascraperImage from 'metascraper-image';
import metascraperUrl from 'metascraper-url';
import puppeteer from 'puppeteer';

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperUrl(),
]);

export async function scrapeUrl(url) {
  try {
    // Launch Puppeteer
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set user agent to avoid blocking
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    );

    // Navigate to the page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract metadata using metascraper
    const html = await page.content();
    const metadata = await scraper({ html, url });

    // Extract price based on rendered font size
    const prices = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements
        .map(el => {
          const style = window.getComputedStyle(el);
          const text = el.textContent.trim();
          const priceMatch = text.match(/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/);
          return priceMatch ? { price: priceMatch[0], fontSize: parseFloat(style.fontSize) } : null;
        })
        .filter(Boolean);
    });

    // Select the price with the largest font size
    const selectedPrice = prices.reduce((max, item) => {
      return item.fontSize > max.fontSize ? item : max;
    }, { price: null, fontSize: 0 }).price;

    await browser.close();

    return {
      title: metadata.title || null,
      description: metadata.description || null,
      image: metadata.image || null,
      price: selectedPrice ? parseFloat(selectedPrice.replace(/[^0-9.]/g, '')) : null,
      currency: selectedPrice ? selectedPrice.match(/[^0-9.,\s]/)?.[0] || null : null
    };
  } catch (error) {
    console.error('Error scraping URL:', error);
    return {
      title: null,
      description: null,
      image: null,
      price: null,
      currency: null
    };
  }
}
