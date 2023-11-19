import { createMobilityRoutine } from "./index.js";

createMobilityRoutine({
  todoistApiKey: process.env.TODOIST_API_KEY,
  logger: console,
});
