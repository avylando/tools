import { WriteStream, createWriteStream } from "node:fs";
import { GaEvent } from "../events-reader/ga-event.interface.js";

export class CSVFileWriter {
  private stream: WriteStream;

  constructor(private readonly filename: string) {
    this.stream = createWriteStream(this.filename, {
      flags: "w",
      encoding: "utf-8",
      autoClose: true,
    });
  }

  public async write(content: string): Promise<void> {
    const writeSuccess = this.stream.write(`${content}\r\n`);
    if (!writeSuccess) {
      return new Promise((resolve) => {
        this.stream.once("drain", resolve);
      });
    }

    return Promise.resolve();
  }

  public async writeEvents(events: GaEvent[]): Promise<void> {
    const content = events.map((event) => {
      return `${event.role},${event.category},${event.action}`;
    });

    return this.write(content.join("\r\n"));
  }
}
