import { getDataGD } from "@/resourcesGD/readFileContentFromDrive";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log("Lista de las series alojadas en la web");
    const elements = await getDataGD(folders.dataSeries, rsc_library.series);

    res.status(200).json({
      elements,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
