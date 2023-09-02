import { scraperFilterStatusTagsPagination } from "@/components/scraperFilterStatusTagsPagination/scraperFilterStatusTagsPagination"; // Ajusta la ruta a tu scraper
import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD";

const fs = require("fs");
const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).end(); // Método no permitido
  }
  try {
    const { filterOptionsStatus, filterOptionsTags, highestPageLink } =
      await scraperFilterStatusTagsPagination();
    // Guarda los datos en archivos utilizando tu función saveUpdateDataToFile
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.filterStatus,
      filterOptionsStatus
    );
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.filterTags,
      filterOptionsTags
    );
    await saveDataToFileGD(
      folders.resourcesWebScraping,
      rsc_library.pagination,
      highestPageLink
    );

    // Envía el objeto con todos los datos en la respuesta
    res.status(200).json({
      data: "se actualizaron los sigts archivos",
      status: rsc_library.filterStatus,
      tags: rsc_library.filterTags,
      pagination: rsc_library.pagination,
    });
  } catch (error) {
    console.error("Error al obtener los datos de filtros de estado:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los datos de filtros de estado" });
  }
}
