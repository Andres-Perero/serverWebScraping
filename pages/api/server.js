// pages/api/server.js
import { CronJob } from "cron";
import { scrapeData } from "../../components/scraperDataInit/scraperDataInit";
//donde se realiza el scraper de cada serie y se guarda en un archivo invidiviar por cada uno
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
import { updateDataGD } from "../../resourcesGD/updateFileContent";
import { serieDetailChapters } from "@/components/scraperSerieDetailChapters/serieDetailChapters";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

const saveUpdateDataToFile = (folder, filename, data) => {
  try {
    const dataGD = updateDataGD(
      folder,
      filename,
      JSON.stringify(data, null, 2)
    );
    return dataGD;
  } catch (error) {
    console.error("Error al guardar los datos en Google Drive:", error.message);
  }
};

// Programa una tarea para actualizar los datos cada 2h
new CronJob(
  "0 */2 * * *",
  async () => {
    try {
      console.log("Actualizando datos de seccion agregados recientes");
      const sectionElements = await scrapeData();
      saveUpdateDataToFile(
        folders.sections,
        rsc_library.sections,
        sectionElements
      );
      // Iterar a través de las series y obtener y guardar los detalles
      for (const section of sectionElements) {
        for (const article of section.articles) {
          const details = await scraperSerieDetails(article.linkSerie);
          saveUpdateDataToFile(
            folders.dataSeriesDetails,
            article.title,
            details
          );
          const serieDetailsChapters = await serieDetailChapters(
            details.title,
            details.link,
            details.episodes
          );
          saveUpdateDataToFile(
            folders.dataSeriesDetailsChapters,
            serieDetailsChapters.title,
            serieDetailsChapters
          );
        }
      }
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
    }
  },
  null,
  true
);

export default async function handler(req, res) {
  console.log("Hola desde la API Route");
  res.status(200).json({ message: "Hola desde la API Route" });
}
