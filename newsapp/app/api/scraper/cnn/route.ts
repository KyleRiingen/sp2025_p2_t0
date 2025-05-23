import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { Page, Browser } from "puppeteer";

type Article = {
    title: string;
    url: string;
    content?: string;
    newsSource: string;
    author?: string; 
    imageUrl?: string;
    datePublished?: string;
};

// Function to fetch content with a longer timeout & error handling
async function getContent(browser: Browser, link: string) { 
    const page: Page = await browser.newPage(); 

    try {
        await page.goto(link, {
            waitUntil: "domcontentloaded",
            timeout: 120000, // 120 seconds timeout
        });

        // Extract all p tag text inside the target div
        const {content, authorName, imageUrl, datePublished} = await page.evaluate(() => {
            const content =  Array.from(document.querySelectorAll('div.article__content[itemprop="articleBody"] p'))
                .map(p => p.textContent?.trim())
                .filter(Boolean);

            const authorName = document.querySelector(".byline__names.vossi-byline__names span")?.textContent?.trim();

            const imageUrl = document.querySelector('meta[property="og:image"]')?.getAttribute("content");

            const datePublished = document.querySelector('meta[name="pubdate"]')?.getAttribute("content") ||
                          document.querySelector('meta[property="article:published_time"]')?.getAttribute("content");

            return {
              content, 
              authorName,
              imageUrl,
              datePublished
            };
        });


        const joinedContent = content.join(" ")

        return {joinedContent, authorName, imageUrl, datePublished}

    } catch (error) {
        console.error(`Failed to load ${link}:`, error);
        return {content: "Content could not be loaded."};
    } finally {
        await page.close(); // Always close the page
    }
}

export async function GET() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.cnn.com/politics", { waitUntil: "domcontentloaded" });

    const articles: Article[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("a.container__link--type-article"))
        .map((el) => {
          const link = el as HTMLAnchorElement;
          let title = link.querySelector(".container__headline-text")?.textContent?.trim() || "";
          return { title, url: link.href, newsSource: "CNN" };
        })
        .filter(article => article.title && article.url);
        // .slice(0, 5); // Limit to 1 articles DURING TESTING ONLY 5/1 - MATHEW
    });

    // Assign content to articles
    const contentPromises = articles.map(async (article) => {
            const { joinedContent, authorName, imageUrl, datePublished } = await getContent(browser, article.url);
            article.content = joinedContent;
            article.author = authorName ?? undefined;
            article.imageUrl = imageUrl ?? undefined;
            article.datePublished = datePublished ?? undefined;
        });
    await Promise.all(contentPromises);

    await browser.close();

    return NextResponse.json({ articles }, { status: 200 });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Failed to scrape articles" }, { status: 500 });
  }
}