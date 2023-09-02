import { getDataGD } from "@/resourcesGD/readFileContentFromDrive";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }
  try {
    console.log("Datos de los diferentes estados de las series");
    const statusSeries = await getDataGD(
      folders.resourcesWebScraping,
      rsc_library.filterStatus
    );

    // Envía el objeto con todos los datos en la respuesta
    res.status(200).json({
      statusSeries,
    });
  } catch (error) {
    console.error("Error al obtener los datos de filtros de estado:", error);
    res
      .status(500)
      .json({ error: "Error al obtener los datos de filtros de estado" });
  }
}
