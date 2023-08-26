import {
  getDataGD,
  getAllFilesInFolder,
} from "../../resourcesGD/readFileContentFromDrive";
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    const seriesListData = await getDataGD(
      folders.dataSeries,
      rsc_library.series
    );
    const listFolderGD = await getAllFilesInFolder(folders.dataSeriesDetails);
    if (listFolderGD.length === 0) {
      return res.status(200).json({
        data: "no hay datos en la BD, se recomiendo agregar detalles de las series",
      });
    }
    // Filtrar los nuevos elementos por link
    const newSeries = seriesListData.filter(
      (newItem) =>
        !listFolderGD.some((oldItem) => oldItem.name === newItem.title)
    );
    if (newSeries.length === 0) {
      return res.status(200).json({ data: "datos se mantienen actualizados" });
    }
    //Guarda los detalles de las nuevas series utilizando tu función saveUpdateDataToFile
    for (const series of newSeries) {
      const details = await scraperSerieDetails(series.link);
      saveUpdateDataToFile(folders.dataSeriesDetails, series.title, details);
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
    res.status(200).json({ data: "datos se actualizaron correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los detalles de las series" });
  }
}
