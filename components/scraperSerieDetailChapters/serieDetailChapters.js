const { scraperSerieDetailChapter } = require("./scraperSerieDetailChapter");

const serieDetailChapters = async (title, link, chapters) => {
  try {
    const chapterDetailsList = []; // Aquí almacenaremos los detalles de los capítulos

    for (const chapter of chapters) {
      const chapterDetails = await scraperSerieDetailChapter(chapter.link);
      chapterDetailsList.push(chapterDetails);
    }

    const serieDetailsChapters = {
      title: title,
      link: link,
      chapters: chapterDetailsList
    };

    return serieDetailsChapters; // Devolvemos los detalles completos de la serie
  } catch (error) {
    console.error("Error en el scraping del enlace:", error);
    // Aquí deberías manejar el error de manera apropiada.
    return {};
  }
};

module.exports = { serieDetailChapters };

