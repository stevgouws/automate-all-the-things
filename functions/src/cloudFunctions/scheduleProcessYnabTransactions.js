// import logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { processYnabTransactions } from "../scripts/processYnabTransactions";

const ynabApiKey = defineSecret("YNAB_API_KEY");
const logger = console;
export const scheduleProcessYnabTransactions = onSchedule(
  {
    region: "europe-west2",
    timeZone: "Europe/London",
    schedule: "every day 05:00",
    secrets: [ynabApiKey],
  },
  async () => {
    logger.log("Starting: processYnabTransactions");
    await processYnabTransactions({
      apiKey: ynabApiKey.value(),
      logger,
    }).catch((error) => {
      logger.error(error);
      throw error;
    });
    logger.log("˚✅ Successfully processed Ynab transactions");
  }
);
