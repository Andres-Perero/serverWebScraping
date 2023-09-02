import { updateDataGD } from "../../resourcesGD/updateFileContent";

const saveDataToFileGD = async (folder, filename, dataObject) => {
  try {
    const { fileFound, data } = await updateDataGD(
      folder,
      filename,
      JSON.stringify(dataObject, null, 2)
    );

    return { fileFound, data };
  } catch (error) {
    console.error("Error al guardar los datos en Google Drive:", error.message);
  }
};

export  { saveDataToFileGD };
