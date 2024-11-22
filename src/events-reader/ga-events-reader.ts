import { createReadStream } from "node:fs";
import EventEmitter from "node:events";
import { GaEvent } from "./ga-event.interface.js";

const gaEventRegex =
  /ga4?\??.sendEventAs(Teacher|Supervizor)\(\{\s*(action|category):\s.?([\sa-zA-Z_-]+).?\,?\s*(action|category):\s.?([\sa-zA-Z_-]+)/g;

export class EventsReader extends EventEmitter {
  private CHUNK_SIZE = 16384; // 16KB

  constructor() {
    super();
  }

  private parseEvent(match: RegExpExecArray): GaEvent {
    const [_, role, key1, value1, key2, value2] = match;
    return { role, [key1]: value1, [key2]: value2 } as unknown as GaEvent;
  }

  public async read(filename: string): Promise<void> {
    const readStream = createReadStream(filename, {
      highWaterMark: this.CHUNK_SIZE,
      encoding: "utf-8",
    });

    let data = "";
    let gaEvents = null;
    let eventsCount = 0;

    readStream.on("readable", async () => {
      let chunk = readStream.read(this.CHUNK_SIZE);
      while (chunk !== null) {
        data += chunk.replace(/\n/g, "");
        chunk = readStream.read(this.CHUNK_SIZE);
      }

      gaEvents = data.matchAll(gaEventRegex);

      if (gaEvents) {
        Array.from(gaEvents).forEach((match) => {
          const parsedEvent = this.parseEvent(match);
          eventsCount++;
          this.emit("event", parsedEvent);
        });
      } else {
        gaEvents = null;
      }
    });

    readStream.once("end", () => {
      this.emit("end", eventsCount, filename);
    });
  }
}
