// pages/api/server.js
import { CronJob } from "cron";
import { scrapeData } from "@/components/scraperDataInit/scraperDataInit";
//donde se realiza el scraper de cada serie y se guarda en un archivo invidiviar por cada uno
import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD";
import { getSeriesDetails } from "@/components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "@/components/getDataSeries/getSeriesChaptersDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

// Programa una tarea para actualizar los datos cada 2h
new CronJob(
  "0 */3 * * *",
  async () => {
    try {
      console.log("Actualizando datos de seccion agregados recientes");
      const sectionElements = await scrapeData();
      await saveDataToFileGD(
        folders.sections,
        rsc_library.sections,
        sectionElements
      );

      for (const section of sectionElements) {
        for (const article of section.articles) {
          const { previousSaveDetails, details } = await getSeriesDetails(
            article
          );

          if (details) {
            let newChapters = [];
            if (previousSaveDetails) {
              console.log("Previous existe, hace el match");
              // Filtrar los nuevos capítulos que no estaban en previousSaveDetails
              newChapters = details.chapters.filter(
                (newChapter) =>
                  !previousSaveDetails.chapters?.some(
                    (prevChapter) => prevChapter.chapter === newChapter.chapter
                  )
              );

              // Crear un nuevo objeto con los nuevos capítulos
              const newDetails = {
                ...details,
                chapters: newChapters,
              };

              await getSeriesChaptersDetails(newDetails);
            } else {
              console.log(
                "Previous no existe, guarda los detalles directamente"
              );
              await getSeriesChaptersDetails(details);
            }
          } else {
            console.log("Detalles de la serie se mantienen actualizados");
          }
        }
      }
      // Envía los datos como respuesta en formato JSON
      res
        .status(200)
        .json({ data: "Datos actualizados de la seccion recien agregados" });
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
