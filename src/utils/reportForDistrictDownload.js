async function downloadFile(url) {
  let _reportName = "report.pdf";

  try {
    const response = await fetch(url);
    const attachmentHeader = response.headers.get("Content-disposition") || "";
    if (attachmentHeader) {
      const attachmentHeaderParts = attachmentHeader.split(";");
      const filenamePart = attachmentHeaderParts.find((part) =>
        part.trim().startsWith("filename")
      );

      if (filenamePart) {
        const cleanedName = filenamePart
          .split("=")[1]
          ?.trim()
          .replace("utf-8''", "")
          .replace(/['"]/g, "");
        _reportName = decodeURIComponent(cleanedName);
      }
    }
    const blob = await response.blob();
    const aElement = document.createElement("a");
    aElement.setAttribute("download", _reportName); // Set the intended file name
    const href = URL.createObjectURL(blob); // Create a temporary URL for the blob
    aElement.href = href;
    aElement.setAttribute("target", "_blank");
    aElement.click(); // Programmatically click the link to trigger the download
    URL.revokeObjectURL(href); // Clean up the temporary URL
  } catch (error) {
    return console.error("Download failed:", error);
  }
}

const ids = [
  2334889, 2334892, 2334895, 2334896, 2334893, 2334894, 2334845, 2334891,
  2334849, 2334844, 2334846, 2334847, 2334848, 2334863, 2574907, 2574874,
  2574873, 2334860, 2334861, 2334864, 2334862, 2334859, 2586634, 2415553,
  2334872, 2334871, 2334875, 2334878, 2334874, 2334877, 2334873, 2334876,
  2334822, 2334828, 2334823, 2574913, 2574912, 2574914, 2334825, 2334829,
  2334826, 2334827, 2334821, 2574882, 2574881, 2574938, 2574937, 2574936,
  2574908, 2471412, 2334815, 2334818, 2334897, 2334820, 2334817, 2334819,
  2334816, 2574891, 2574892, 2574890, 2574889, 2574929, 2574935, 2334842,
  2396437, 2334843, 2334837, 2334898, 2334840, 2334839, 2334838, 2334841,
  2574903, 2574904, 2574905, 2574906, 2574896, 2574897, 2334858, 2334854,
  2334855, 2334856, 2334851, 2334852, 2334850, 2334853, 2574839, 2574838,
  2574900, 2574899, 2334831, 2334833, 2334836, 2334834, 2334830, 2334835,
  2334832, 2574917, 2574862, 2574836, 2574835, 2574834, 2431159, 2574863,
  2431169, 2431167, 2431157, 2431171, 2577935, 2574918, 2574919, 2574922,
  2574925, 2574859, 2574858, 2520773, 2431162, 2431158, 2431170, 2431172,
  2574888, 2574884, 2574921, 2574923, 2574924, 2461326, 2574883, 2431161,
  2431165, 2334882, 2431168, 2334884, 2431164, 2431166, 2334881, 2334886,
  2334879, 2334888, 2431160, 2334880, 2334885, 2334883, 2334887, 2431163,
  2334865, 2334866, 2334869, 2334870, 2334867, 2334868,
];

const runDownloads = async () => {
  for (const id of ids) {
    const url = `https://happynumbers.com/reports/parent/pdf?groupId=${id}&language=en&hideCurriculum=true`;
    // const url = `https://reports.happynumbers.com/reports/parent/pdf?groupId=${id}&language=en`; --- IGNORE ---
    // --- IGNORE ---
    // eslint-disable-next-line no-await-in-loop
    await downloadFile(url);
  }
};
