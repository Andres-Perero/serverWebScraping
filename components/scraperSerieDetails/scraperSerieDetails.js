const puppeteer = require("puppeteer");

const scraperSerieDetails = async (urlSerie) => {
  const maxRetries = 3; // Número máximo de reintentos
  let seriesDetails;
  let retries = 0;

  while (!seriesDetails && retries < maxRetries) {
    try {
      const browser = await puppeteer.launch({ timeout: 60000 }); // Aumenta el tiempo a 60 segundos

      const page = await browser.newPage();
      // Aumentar el tiempo de espera a 60 segundos (60000 ms)
      await page.goto(urlSerie, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page.waitForSelector(".title");
      seriesDetails = await page.evaluate(async (urlSerie) => {
        const title = document.querySelector(".title").textContent.trim();

        const type = document
          .querySelector(".anime-type-peli")
          .textContent.trim();
        const status = document
          .querySelector(".anime-type-peli:nth-child(2)")
          .textContent.trim();
        const genres = Array.from(document.querySelectorAll(".genres a")).map(
          (genre) => genre.textContent.trim()
        );
        const synopsis = document.querySelector(".sinopsis").textContent.trim();
        const views = parseInt(
          document.querySelector("#score").textContent.trim()
        );

        // Extract episode details
        const chapters = Array.from(
          document.querySelectorAll(".episodes-list li")
        ).map((episode) => {
          const urlChapter = episode.querySelector("a").href;
          const chapter = episode.querySelector("p span").textContent.trim();
          return { chapter, urlChapter };
        });
        const numChapters = chapters.length; // Agregar la cantidad de capítulos
        //generate idSerie

        return {
          title,
          urlSerie,
          type,
          status,
          genres,
          synopsis,
          views,
          numChapters,
          chapters,
        };
      }, urlSerie);

      await browser.close();
    } catch (error) {
      console.error("Error en el scraping del enlace:", error);
      retries++;
    }
  }

  if (!seriesDetails) {
    throw new Error("Error en el scraping del enlace");
  }

  return seriesDetails;
};

export  { scraperSerieDetails };
