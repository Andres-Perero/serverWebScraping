import { getDataGD } from "@/resourcesGD/readFileContentFromDrive";

const folders = require("../../data-googleapis/route-rsc-files.json");
const rsc_library = require("../../resources/library.json");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Método no permitido
  }

  try {
    console.log("Datos de seccion agregados recientemente");
    const sectionElements = await getDataGD(
      folders.sections,
      rsc_library.sections
    );

    res.status(200).json({
      sectionElements,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
