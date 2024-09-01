import { initializeApp } from "firebase-admin/app";
import { scheduleCreateMobilityRoutine } from "./src/cloudFunctions/scheduleCreateMobilityRoutine.js";
import { scheduleProcessYnabTransactions } from "./src/cloudFunctions/scheduleProcessYnabTransactions.js";

initializeApp();

export { scheduleCreateMobilityRoutine, scheduleProcessYnabTransactions };
