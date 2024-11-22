import { Command } from "commander";
import chalk from "chalk";

import { EventsReader } from "../../events-reader/ga-events-reader.js";
import { CSVFileWriter } from "../../file-writer/file-writer.js";
import { GaEvent } from "../../events-reader/ga-event.interface.js";
import { createFilesGetter } from "../../utils/fs.js";

const program = new Command();
const getFiles = createFilesGetter();

const importCommand = program
  .createCommand("import")
  .argument("<directory>", "Path to the directory with .js files")
  .argument("<pathname>", "Path to write the .tsv file")
  .description(
    "Reads javascript file and creates new .tsv file with found GA events"
  )
  .action(async (directory, writePathname) => {
    try {
      const reader = new EventsReader();
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

      const files = getFiles(directory);

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
