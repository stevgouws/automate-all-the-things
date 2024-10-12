// import logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { processYnabTransactions } from "../scripts/processYnabTransactions";
import { logger } from "../services/LoggerService";

const ynabApiKey = defineSecret("YNAB_API_KEY");
export const scheduleProcessYnabTransactions = onSchedule(
  {
    region: "europe-west2",
    timeZone: "Europe/London",
    schedule: "every 60 mins from 06:00 to 22:00",
    timeoutSeconds: 60 * 5,
    secrets: [ynabApiKey],
  },
  async () => {
    logger.info("Starting: processYnabTransactions");
    await processYnabTransactions({
      apiKey: ynabApiKey.value(),
    }).catch((error) => {
      logger.error(error);
      throw error;
    });
    logger.info("˚✅ Successfully processed Ynab transactions");
  }
);
