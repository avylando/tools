import { createReadStream } from "node:fs";
import EventEmitter from "node:events";
import { GaEvent } from "./ga-event.interface.js";

const gaEventRegex =
  /ga4?\??.sendEventAs(Teacher|Supervizor)\(\{\s*(action|category):\s.?([\sa-zA-Z_-]+).?\,?\s*(action|category):\s.?([\sa-zA-Z_-]+)/g;

export class EventsReader extends EventEmitter {
  private CHUNK_SIZE = 16384; // 16KB

  private matches: RegExpExecArray[] = [];
  private parsedEvents: GaEvent[] = [];

  constructor() {
    super();
  }

  private isSameEvents(event1: GaEvent, event2: GaEvent): boolean {
    return (
      event1.role === event2.role &&
      event1.category === event2.category &&
      event1.action === event2.action
    );
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
    let eventsCount = 0;

    readStream.on("readable", async () => {
      let chunk = readStream.read(this.CHUNK_SIZE);
      while (chunk !== null) {
        data += chunk.replace(/\n/g, "");
        chunk = readStream.read(this.CHUNK_SIZE);
      }

      this.matches = Array.from(data.matchAll(gaEventRegex));

      if (this.matches.length > 0) {
        this.matches.forEach((match) => {
          const parsedEvent = this.parseEvent(match);
          if (
            this.parsedEvents.some((event) =>
              this.isSameEvents(event, parsedEvent)
            )
          )
            return;

          this.parsedEvents.push(parsedEvent);
          eventsCount++;
          this.emit("event", parsedEvent);
        });
      }
    });

    readStream.once("end", () => {
      this.matches = [];
      this.emit("end", eventsCount, filename);
    });
  }
}
