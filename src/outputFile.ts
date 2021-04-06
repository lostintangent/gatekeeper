import * as path from "path";
const fs = require("fs").promises;

export default class OutputFile {
  private fileDescriptor: number | undefined;
  private writePromise: Promise<void> | undefined;
  private canWrite: boolean = true;

  public constructor(
    private readonly fileName: string,
    private readonly directory: string
  ) {}

  public async openAsync(): Promise<string | undefined> {
    try {
      await fs.mkdir(this.directory, { recursive: true });
    } catch (e) {}
    return await this.openFileAsync();
  }

  private openFileAsync = async (index: number = 0) => {
    if (index === 5) {
      this.canWrite = false;
      return;
    }

    const datePrefix = new Date()
      .toISOString()
      .replace(/T/, "_")
      .replace(/:|-/g, "")
      .replace(/\..+/, "");

    // Ensure a unique file name
    const indexFileName = path.join(
      this.directory,
      `${datePrefix}_${Date.now()}${index}_${this.fileName}`
    );

    try {
      this.fileDescriptor = await fs.open(indexFileName, "ax"); // Append, fail if exists
    } catch (err) {
      if (err.code === "EEXIST") {
        // try the nex index
        await this.openFileAsync(index + 1);
      } else {
        this.canWrite = false;
      }
    }

    this.writePromise = Promise.resolve();
    return indexFileName;
  };

  public append(content: string) {
    if (this.canWrite === false) {
      return;
    }
    this.writePromise = this.writePromise!.then(() => {
      fs.writeFile(this.fileDescriptor!, content).catch((e: any) => {
        this.canWrite = false;
      });
    });
  }
}
