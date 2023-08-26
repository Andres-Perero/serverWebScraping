// Importar las bibliotecas necesarias
const { google } = require("googleapis");
const data_key = require("../data-googleapis/storage-web-scraping-396800-96043ff114f4.json");
import { readFileContentFromDrive } from "./readFileContentFromDrive";
import { uploadFileToDrive } from "./uploadFileToDrive";

// Configurar la autenticación para la cuenta de servicio
const auth = new google.auth.GoogleAuth({
  credentials: data_key,
  scopes: ["https://www.googleapis.com/auth/drive"],
});

// Buscar el archivo por su nombre y en una carpeta específica
async function findFileInFolder(folderId, filename) {
  const drive = google.drive({ version: "v3", auth });
  let nextPageToken = null;

  try {
    do {
      const response = await drive.files.list({
        q: `'${folderId}' in parents and name = '${filename}'`,
        pageToken: nextPageToken,
      });

      const matchingFiles = response.data.files.filter(file => file.name === filename);

      if (matchingFiles.length > 0) {
        return matchingFiles[0]; // Devuelve el primer archivo encontrado
      }

      nextPageToken = response.data.nextPageToken; // Obtiene el token para la siguiente página
    } while (nextPageToken); // Repite el proceso si hay más páginas

    console.log("Archivo no encontrado en la carpeta.");
    return null;
  } catch (error) {
    console.error("Error al buscar el archivo:", error.message);
    return null;
  }
}

// Modificar el contenido de un archivo en Google Drive por su ID
async function updateFileContent(fileId, newContent) {
  const drive = google.drive({ version: "v3", auth });
  try {
    const media = {
      mimeType: "application/json",
      body: newContent,
    };
    const response = await drive.files.update({
      fileId,
      media: media,
    });
    console.log("Archivo actualizado en Google Drive. ID:", response.data.name);
  } catch (error) {
    console.error(
      "Error al actualizar el archivo en Google Drive:",
      error.message
    );
  }
}

async function updateDataGD(folderId, filename, newContent) {
  try {
    const file = await findFileInFolder(folderId, filename);
    if (file) {
      console.log("Archivo encontrado:", file.name);
      const readfile = readFileContentFromDrive(file.id);
      await updateFileContent(file.id, newContent);
      return readfile;
    } else {
      console.log("Archivo No encontrado, creando :", filename);
      await uploadFileToDrive(folderId, filename, newContent);
      return newContent;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

module.exports = { updateDataGD };
