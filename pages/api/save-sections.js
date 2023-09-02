import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD";
import { scrapeData } from "@/components/scraperDataInit/scraperDataInit";
import { getSeriesDetails } from "@/components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "@/components/getDataSeries/getSeriesChaptersDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Método no permitido
  }

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

            await getSeriesChaptersDetails(details);
          }
        } else {
          console.log("detailsSerie se mantiene actualizado");
        }
      }
    }
    // Envía los datos como respuesta en formato JSON
    res
      .status(200)
      .json({ data: "Datos actualizados de la seccion recien agregados" });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
