import * as os from "os";
import * as path from "path";
import * as vsls from "vsls";
import OutputFile from "./outputFile";

const LOG_FILE = "ActivityLog.jsonl";
const LOG_DIRECTORY = "VSLiveShareActivityLogs";

class ActivityLog {
  private outputFile = new OutputFile(
    LOG_FILE,
    path.join(os.tmpdir(), LOG_DIRECTORY)
  );

  public async openAsync(): Promise<void> {
    await this.outputFile.openAsync();
  }

  public log(entry: any): void {
    this.outputFile.append(`${JSON.stringify(entry)}${"\n"}`);
  }
}

export async function registerActivityLog(api: vsls.LiveShare) {
  if (api.onActivity) {
    const activityLog = new ActivityLog();
    await activityLog.openAsync();

    api.onActivity(activityLog.log.bind(activityLog));
  }
}
