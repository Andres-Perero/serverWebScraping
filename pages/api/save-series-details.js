import {
  getDataGD,
  getAllFilesInFolder,
} from "../../resourcesGD/readFileContentFromDrive";

import { getSeriesDetails } from "@/components/getDataSeries/getSeriesDetails";
import { getSeriesChaptersDetails } from "@/components/getDataSeries/getSeriesChaptersDetails";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

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

    for (const series of newSeries) {
      const {previousSaveDetails,details} = await getSeriesDetails(series);
      if (details) {
        await getSeriesChaptersDetails(details);
      }
    }
    res.status(200).json({ data: "datos se actualizaron correctamente" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los detalles de las series" });
  }
}
