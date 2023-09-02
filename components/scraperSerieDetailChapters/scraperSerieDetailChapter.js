const puppeteer = require("puppeteer");

const maxRetries = 3; // Número máximo de reintentos

const scraperSerieDetailChapter = async (urlChapter) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const browser = await puppeteer.launch({ timeout: 60000 });
      const page = await browser.newPage();
      await page.goto(urlChapter, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      const scrapedData = await page.evaluate((urlChapter) => {
        const titleElement = document.querySelector(".anime-title.text-center");
        const title = titleElement.textContent.trim();

        const episodeNavLinks = document.querySelectorAll(".episodes-nav a");
        const previousEpisodeLink =
          Array.from(episodeNavLinks)
            .find((link) =>
              link.innerHTML.includes('<i class="fa-arrow-left"></i>')
            )
            ?.getAttribute("href") || "";
        const urlSerie =
          Array.from(episodeNavLinks)
            .find((link) =>
              link.innerHTML.includes('<i class="fa-list-ul"></i>')
            )
            ?.getAttribute("href") || "";
        const nextEpisodeLink =
          Array.from(episodeNavLinks)
            .find((link) =>
              link.innerHTML.includes('<i class="fa-arrow-right"></i>')
            )
            ?.getAttribute("href") || "";

        const chapterImageElements =
          document.querySelectorAll("#chapter_imgs img");
        const imageUrls = Array.from(chapterImageElements)
          .map((img) => img.src)
          .filter((src) => src);

        return {
          title: title,
          urlSerie: urlSerie,
          urlChapter: urlChapter,
          previousEpisodeLink: previousEpisodeLink,
          nextEpisodeLink: nextEpisodeLink,
          imageUrls: imageUrls,
        };
      }, urlChapter);

      await browser.close();
      return scrapedData;
    } catch (error) {
      console.error("Error en el scraping del enlace:", error);
      retries++;
      console.log(`Reintentando... Intento ${retries} de ${maxRetries}`);
    }
  }

  throw new Error(
    "Error en el scraping del enlace después de múltiples intentos"
  );
};

export { scraperSerieDetailChapter };
