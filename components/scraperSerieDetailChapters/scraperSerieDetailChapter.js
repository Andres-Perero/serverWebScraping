const puppeteer = require("puppeteer");

const scraperSerieDetailChapter = async (link) => {
  try {
    const browser = await puppeteer.launch({ timeout: 60000 }); // Aumenta el tiempo a 60 segundos

    //const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Aumentar el tiempo de espera a 60 segundos (60000 ms)
    await page.goto(link, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Realiza el scraping de los datos que necesitas
    const scrapedData = await page.evaluate(() => {
      const titleElement = document.querySelector(".anime-title.text-center");
      const title = titleElement.textContent.trim();

      const episodeNavLinks = document.querySelectorAll(".episodes-nav a");
      const previousEpisodeLink =
        Array.from(episodeNavLinks)
          .find((link) =>
            link.innerHTML.includes('<i class="fa-arrow-left"></i>')
          )
          ?.getAttribute("href") || "";
      const listEpisodes =
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
      const imageUrls = Array.from(chapterImageElements).map((img) => img.src);

      return {
        title: title,
        listEpisodes: listEpisodes,
        previousEpisodeLink: previousEpisodeLink,
        nextEpisodeLink: nextEpisodeLink,
        imageUrls: imageUrls,
      };
    });

    await browser.close();
    res.json(scrapedData);
  } catch (error) {
    console.error("Error en el scraping del enlace:", error);
    res.status(500).json({ error: "Error en el scraping del enlace" });
  }
};

module.exports = { scraperSerieDetailChapter };
