import * as path from "path";
import * as vsls from "vsls";
import OutputFile from "./outputFile";

const LOG_FILE = "ActivityLog.jsonl";
const LOG_DIRECTORY = "ActivityLogs";

class ActivityLog {
  private outputFile: OutputFile;

  constructor(logPath: string) {
    this.outputFile = new OutputFile(
      LOG_FILE,
      path.join(logPath, LOG_DIRECTORY)
    );
  }

  public async openAsync(): Promise<void> {
    await this.outputFile.openAsync();
  }

  public log(entry: any): void {
    this.outputFile.append(`${JSON.stringify(entry)}${"\n"}`);
  }
}

export async function registerActivityLog(
  api: vsls.LiveShare,
  logPath: string
) {
  if (api.onActivity) {
    const activityLog = new ActivityLog(logPath);
    await activityLog.openAsync();

    api.onActivity(activityLog.log.bind(activityLog));
  }
}
