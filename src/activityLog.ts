import * as os from "os";
import * as path from "path";
import OutputFile from "./outputFile";

export default class ActivityLog {
  private outputFile = new OutputFile(
    "ActivityLog.jsonl",
    path.join(os.tmpdir(), "VSLiveShareActivityLogs")
  );

  public async openAsync(): Promise<void> {
    await this.outputFile.openAsync();
  }

  public log(entry: any): void {
    this.outputFile.append(`${JSON.stringify(entry)}${'\n'}`);
  }
}
