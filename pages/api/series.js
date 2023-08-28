import { scraperLibrary } from "../../components/scraperSeries/scraperSeries"; // Ajusta la ruta a tu función de scraper
import { updateDataGD } from "../../resourcesGD/updateFileContent";
import { getDataGD } from "../../resourcesGD/readFileContentFromDrive"; // Importa las funciones necesarias para obtener los datos
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
import { serieDetailChapters } from "@/components/scraperSerieDetailChapters/serieDetailChapters";

const fs = require("fs");
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Método no permitido
  }
  try {
    const paginationSeries = await getDataGD(
      folders.resourcesWebScraping,
      rsc_library.pagination
    );
    const totalPages = paginationSeries.value;
    // Obtén las series utilizando tu función de scraperLibrary
    const SeriesPages = await scraperLibrary(totalPages);
    // Actualiza las series y obtén los datos previos
    const previousData = await saveUpdateDataToFile(
      folders.dataSeries,
      rsc_library.series,
      SeriesPages
    );

    //Filtra los nuevos elementos por link
    const newSeries = SeriesPages.filter(
      (newItem) =>
        !previousData.some((oldItem) => oldItem.link === newItem.link)
    );
    if (newSeries.length === 0) {
      return res.status(200).json({ data: "datos se mantienen actualizados" });
    }
    //Guarda los detalles de las nuevas series utilizando tu función saveUpdateDataToFile
    for (const series of newSeries) {
      const details = await scraperSerieDetails(series.link);
      //guardo los datos de los detalles de la serie 
      saveUpdateDataToFile(folders.dataSeriesDetails, series.title, details);
      const serieDetailsChapters = await serieDetailChapters(
        details.title,
        details.link,
        details.episodes
      );
      // guardo los datos de los capitulos de la serie
      saveUpdateDataToFile(
        folders.dataSeriesDetailsChapters,
        serieDetailsChapters.title,
        serieDetailsChapters
      );
    }
    res.status(200).json({ data: "datos se actualizaron correctamente" });
  } catch (error) {
    console.error("Error al obtener los datos de series:", error);
    res.status(500).json({ error: "Error al obtener los datos de series" });
  }
}
