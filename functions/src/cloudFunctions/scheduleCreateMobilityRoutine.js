import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { createMobilityRoutine } from "../scripts/createMobilityRoutine/index.js";
import { logger } from "../services/LoggerService.js";

const todoistApiKey = defineSecret("TODOIST_API_KEY");

export const scheduleCreateMobilityRoutine = onSchedule(
  {
    region: "europe-west2",
    timeZone: "Europe/London",
    schedule: "every day 05:00",
    secrets: [todoistApiKey],
  },
  async () => {
    logger.info("Starting create mobility routine");
    await createMobilityRoutine({
      todoistApiKey: todoistApiKey.value(),
      logger,
    }).catch((error) => {
      logger.error(error);
      throw error;
    });
    logger.info("✅ Successfully created mobility routine");
  }
);
