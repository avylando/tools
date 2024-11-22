import { Command } from "commander";
import chalk from "chalk";

import { EventsReader } from "../../events-reader/ga-events-reader.js";
import { CSVFileWriter } from "../../file-writer/file-writer.js";
import { GaEvent } from "../../events-reader/ga-event.interface.js";
import { createFilesGetter } from "../../utils/fs.js";

const program = new Command();
const getFiles = createFilesGetter();
const reader = new EventsReader();

const importCommand = program
  .createCommand("import")
  .argument("<inputPath>", "Path to the directory or file to read")
  .argument("<pathname>", "Path to write the .tsv file")
  .description(
    "Reads javascript file and creates new .tsv file with found GA events"
  )
  .action(async (inputPath, writePathname) => {
    try {
      const writer = new CSVFileWriter(writePathname);

      const events: GaEvent[] = [];
      reader.on("event", (event: GaEvent) => {
        events.push(event);
      });
      reader.on("end", async (eventsCount, filename) => {
        console.log(
          chalk.green(
            `Reading ${filename} successful, total events read: ${eventsCount}`
          )
        );

        if (events.length > 0) {
          await writer.writeEvents(events);
          console.log(chalk.green("Writing successful"));
          events.length = 0;
        }
      });

      const files = getFiles(inputPath);
      console.log(files);
      files.forEach((pathname) => {
        console.log(chalk.blue(`Reading file: ${pathname}`));
        reader.read(pathname);
      });
    } catch (err) {
      console.log(chalk.red(`Error reading file: ${err}`));
      throw err;
    }
  });

export { importCommand };
