import logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { createMobilityRoutine } from "../scripts/createMobilityRoutine/index.js";

const todoistApiKey = defineSecret("TODOIST_API_KEY");

export const scheduleCreateMobilityRoutine = onSchedule(
  {
    region: "europe-west2",
    timeZone: "Europe/London",
    schedule: "every day 00:00",
    secrets: [todoistApiKey],
  },
  async () => {
    logger.log("Starting create mobility routine");
    await createMobilityRoutine({
      todoistApiKey: todoistApiKey.value(),
      logger,
    }).catch((error) => {
      logger.error(error);
      throw error;
    });
    logger.log("✅ Successfully created mobility routine");
  }
);
