import { getDataGD } from "../../resourcesGD/readFileContentFromDrive"; // Importa las funciones necesarias para obtener los datos
const fs = require("fs");
// nombre de las carpetas donde se aloja la informacion
const folders = require("../../data-googleapis/route-rsc-files.json");
// etiquetas para hacer el scraper
const rsc_library = require("../../resources/library.json");
//donde se realiza el scraper de cada serie y se guarda en un archivo invidiviar por cada uno
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
import { updateDataGD } from "../../resourcesGD/updateFileContent";

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
    // Obtén los datos de las secciones desde tu fuente de datos (por ejemplo, Google Drive)
    const sections = await getDataGD(folders.sections, rsc_library.sections);
    // for (const section of sections) {
    //   for (const article of section.articles) {
    //     const details = await scraperSerieDetails(article.linkSerie);

    //     saveUpdateDataToFile(folders.dataSeriesDetails, article.title, details);
    //   }
    // }
    // Envía los datos como respuesta en formato JSON
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    res.status(500).json({ error: "Error al obtener los datos" });
  }
}
