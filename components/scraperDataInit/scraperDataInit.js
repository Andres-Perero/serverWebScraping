const puppeteer = require("puppeteer");
const dataset = require("../../resources/data.json");
const fs = require("fs");
const scrapeData = async () => {
  const maxRetries = 3; // Número máximo de reintentos
  let sectionElements = null;
  let retries = 0;

  while (!sectionElements && retries < maxRetries) {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      // Aumentar el tiempo de espera a 60 segundos (60000 ms)
      await page.goto(dataset.webSite, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page.waitForSelector("body");

      // Extraer los datos de las secciones y los artículos de la página
      sectionElements = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll("section"));

        return sections.reduce((acc, section) => {
          const header = section.querySelector(".header");
          const titleElement = header.querySelector(".title");
          const linkElement = header.querySelector("a[href]");

          const articles = Array.from(
            section.querySelectorAll("ul li article")
          );
          const articlesData = articles.map((article) => {
            // Extraer los datos de cada artículo individual
            const urlChapter = article.querySelector("a:nth-child(1)");
            const urlSerie = article.querySelector("a:nth-child(2)");
            const img = article.querySelector("img[src]");
            const title = article.querySelector(".title");
            const timestamp = article.querySelector(".text-secondary");
            const chapterNumberElement =
              article.querySelector(".anime-type-peli");
            const typeElement = article.querySelector(".anime-badge");

            return {
              urlChapter: urlChapter ? urlChapter.href : "",
              urlSerie: urlSerie ? urlSerie.href : "",
              img: img ? img.src : "",
              title: title ? title.textContent.trim() : "",
              timestamp: timestamp ? timestamp.textContent.trim() : "",
              chapterNumber: chapterNumberElement
                ? chapterNumberElement.textContent.trim()
                : "",
              type: typeElement ? typeElement.textContent.trim() : "",
            };
          });

          if (articlesData.length > 0) {
            // Agregar la sección solo si tiene artículos
            acc.push({
              sectionTitle: titleElement ? titleElement.textContent.trim() : "",
              sectionLink: linkElement ? linkElement.href : "",
              articles: articlesData,
            });
          }

          return acc;
        }, []);
      });

      await browser.close();
    } catch (error) {
      console.error("Error en el web scraping:", error);
      retries++;
    }
  }

  if (!sectionElements) {
    throw new Error("Error en el web scraping");
  }

  return sectionElements;
};

export { scrapeData };
