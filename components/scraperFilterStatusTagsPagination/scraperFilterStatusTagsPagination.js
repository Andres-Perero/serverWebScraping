const puppeteer = require("puppeteer");
const datasets = require("@/resources/data.json");

const scraperFilterStatusTagsPagination = async () => {
  const maxRetries = 3; // Número máximo de reintentos
  let data = null;
  let retries = 0;

  while (!data && retries < maxRetries) {
    try {
      console.log("Actualizando datos de los filtros de etiquetas...");
      const browser = await puppeteer.launch({ timeout: 60000 });
      const page = await browser.newPage();
      await page.goto(datasets.webSiteLibrary);
      await page.waitForSelector(".form-group");

      // Selecciona el segundo formulario de filtro (estado)
      const filterBxStatus = (await page.$$(".form-group"))[0];
      const selectElementStatus = await filterBxStatus.$(
        ".form-control.custom-select"
      );

      const filterOptionsStatus = await selectElementStatus.evaluate(
        (select) => {
          const options = Array.from(select.querySelectorAll("option"));
          return options
            .filter((option) => option.value)
            .map((option) => ({
              value: option.value,
              text: option.textContent.trim(),
            }));
        }
      );

      // Selecciona el segundo formulario de filtro (etiquetas)
      const filterBxTags = (await page.$$(".form-group"))[1];
      const selectElementTags = await filterBxTags.$(
        ".form-control.custom-select"
      );

      const filterOptionsTags = await selectElementTags.evaluate((select) => {
        const options = Array.from(select.querySelectorAll("option"));
        return options
          .filter((option) => option.value)
          .map((option) => ({
            value: option.value,
            text: option.textContent.trim(),
          }));
      });

      await page.waitForSelector(".pagination");
      const paginationElement = await page.$(".pagination");
      const linkElements = await paginationElement.$$("a");
      let highestPageLink = { href: "", value: 0 };

      for (const link of linkElements) {
        const href = await link.evaluate((a) => a.getAttribute("href"));
        const text = await link.evaluate((a) => a.textContent);
        const pageValue = parseInt(text);

        if (!isNaN(pageValue) && pageValue > highestPageLink.value) {
          highestPageLink = { href, value: pageValue };
        }
      }

      await browser.close();

      data = {
        filterOptionsStatus,
        filterOptionsTags,
        highestPageLink,
      };
    } catch (error) {
      console.error("Error al actualizar los datos de los filtros:", error);
      retries++;
    }
  }

  if (!data) {
    throw new Error("Error al actualizar los datos de los filtros");
  }

  return data;
};

export { scraperFilterStatusTagsPagination };
