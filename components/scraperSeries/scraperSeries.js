const puppeteer = require("puppeteer");
const datasets = require("@/resources/data.json");

const scraperSeries = async (pageNumber) => {
  const browser = await puppeteer.launch({ timeout: 60000 }); // Aumenta el tiempo a 60 segundos

  const page = await browser.newPage();

  const url = `${datasets.webSiteLibrary}?page=${pageNumber}`;
  // Aumentar el tiempo de espera a 60 segundos (60000 ms)
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

  //await page.goto(url);
  await page.waitForSelector(".anime"); // Esperar a que los elementos estén disponibles

  const items = await page.evaluate(() => {
    const itemElements = Array.from(document.querySelectorAll(".anime"));
    return itemElements.map((itemElement) => {
      // Extraer la información relevante del elemento
      const title = itemElement.querySelector(".title").textContent.trim();
      const type = itemElement.querySelector(".anime-badge").textContent.trim();
      const urlSerie = itemElement.querySelector("a").getAttribute("href");
      const image = itemElement.querySelector("img").getAttribute("src");

      return {  title, type, urlSerie, image };
    });
  });

  await browser.close();
  return items;
};

const scraperLibrary = async (totalPages) => {
  const allItems = [];
  const maxRetries = 3; // Número máximo de reintentos

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    console.log("pagina: " + pageNumber +"/" + totalPages);

    let itemsOnPage;
    let retries = 0;

    while (!itemsOnPage && retries < maxRetries) {
      try {
        itemsOnPage = await scraperSeries(pageNumber);
      } catch (error) {
        console.error("Error en el scraping de la página:", error);
        retries++;
      }
    }

    if (itemsOnPage) {
      allItems.push(...itemsOnPage);
    }
  }

  return allItems;
};

export { scraperLibrary };
