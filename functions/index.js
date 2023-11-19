import { initializeApp } from "firebase-admin/app";
import { scheduleCreateMobilityRoutine } from "./src/cloudFunctions/scheduleCreateMobilityRoutine.js";

initializeApp();

export { scheduleCreateMobilityRoutine };
