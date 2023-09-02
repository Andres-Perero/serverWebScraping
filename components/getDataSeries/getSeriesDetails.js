// getSeriesDetails.js
import { scraperSerieDetails } from "../../components/scraperSerieDetails/scraperSerieDetails";
import { saveDataToFileGD } from "@/components/saveDataToFileGD/saveDataToFileGD";

import folders from "../../data-googleapis/route-rsc-files.json";
import { generateUniqueSerieId } from "../saveDataToFileGD/generateUniqueSerieId";

function areObjectsEqual(obj1, obj2) {
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!areObjectsEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

const getSeriesDetails = async (article) => {
  try {
    let previousSaveDetails = null;
    console.log("Serie: " + article.title);
    const details = await scraperSerieDetails(article.urlSerie);

    if (details) {
      const idSerie = await generateUniqueSerieId(
        details.urlSerie,
        details.title
      );
      const newDetails = { idSerie, ...details };
      const { fileFound, data } = await saveDataToFileGD(
        folders.dataSeriesDetails,
        newDetails.idSerie,
        newDetails
      );

      if (fileFound) {
        const isEqual = areObjectsEqual(data.chapters, newDetails.chapters);
        if (isEqual) {
          return { previousSaveDetails, details: null };
        } else {
          return { previousSaveDetails: data, details: newDetails };
        }
      } else {
        return { previousSaveDetails, details: newDetails };
      }
    }
  } catch (error) {
    console.error("Error al obtener detalles de la serie:", error);
    return null; // Retorna null en caso de error
  }
};

export { getSeriesDetails };
