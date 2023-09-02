import { serieDetailChapters } from "@/components/scraperSerieDetailChapters/serieDetailChapters";
import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD"; // Asegúrate de tener una función para leer el archivo existente
import folders from "../../data-googleapis/route-rsc-files.json";
import { getDataGD } from "@/resourcesGD/readFileContentFromDrive";

const getSeriesChaptersDetails = async (details) => {
  try {
    const serieDetailsChapters = await serieDetailChapters(
      details.idSerie,
      details.title,
      details.urlSerie,
      details.chapters
    );

    if (serieDetailsChapters) {
      // Intenta leer el archivo existente
      const existingData = await getDataGD(
        folders.dataSeriesDetailsChapters,
        serieDetailsChapters.idSerie
      );

      if (existingData) {
        // El archivo existe, agrega los nuevos capítulos al contenido existente
        const updatedData = {
          ...existingData,
          chapters: [
            ...serieDetailsChapters.chapters,
            ...existingData.chapters,
          ],
        };

        // Guarda el contenido actualizado en el archivo
        await saveDataToFileGD(
          folders.dataSeriesDetailsChapters,
          serieDetailsChapters.idSerie,
          updatedData
        );
      } else {
        // El archivo no existe, guarda los nuevos detalles de los capítulos directamente
        await saveDataToFileGD(
          folders.dataSeriesDetailsChapters,
          serieDetailsChapters.idSerie,
          serieDetailsChapters
        );
      }
    }
  } catch (error) {
    console.error("Error al obtener detalles de los capítulos:", error);
  }
};

export { getSeriesChaptersDetails };
