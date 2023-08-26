import { scraperFilterStatusTagsPagination } from "../../components/scraperFilterStatusTagsPagination/scraperFilterStatusTagsPagination"; // Ajusta la ruta a tu scraper
import { updateDataGD } from "../../resourcesGD/updateFileContent"; // Ajusta la ruta a tu función de guardar y actualizar datos
const fs = require("fs");
// nombre de las carpetas donde se aloja la informacion
const folders = require("../../data-googleapis/route-rsc-files.json");
// etiquetas para hacer el scraper
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
    const { filterOptionsStatus, filterOptionsTags, highestPageLink } =
      await scraperFilterStatusTagsPagination();
    // Guarda los datos en archivos utilizando tu función saveUpdateDataToFile
    saveUpdateDataToFile(
      folders.resourcesWebScraping,
      rsc_library.filterStatus,
      filterOptionsStatus
    );
    saveUpdateDataToFile(
      folders.resourcesWebScraping,
      rsc_library.filterTags,
      filterOptionsTags
    );
    saveUpdateDataToFile(
      folders.resourcesWebScraping,
      rsc_library.pagination,
      highestPageLink
    );

    // Envía el objeto con todos los datos en la respuesta
    res.status(200).json({
      filterOptionsStatus,
      filterOptionsTags,
      highestPageLink,
    });
  } catch (error) {
    console.error("Error al obtener los datos de filtros de estado:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los datos de filtros de estado" });
  }
}
