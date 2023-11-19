/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import logger from "firebase-functions/logger";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { createMobilityRoutine } from "./src/scripts/createMobilityRoutine/index.js";

const todoistApiKey = defineSecret("TODOIST_API_KEY");

initializeApp();

// // Take the text parameter passed to this HTTP endpoint and insert it into
// // Firestore under the path /messages/:documentId/original
// export const addmessage = onRequest(async (req, res) => {
//   // Grab the text parameter.
//   const original = req.query.text;
//   // Push the new message into Firestore using the Firebase Admin SDK.
//   const writeResult = await getFirestore()
//     .collection("messages")
//     .add({ original });
//   // Send back a message that we've successfully written the message
//   res.json({ result: `Message with ID: ${writeResult.id} added.` });
// });

// export const scheduleTester = onSchedule("* * * * *", async (event) => {
//   logger.log("Test scheduled job");
//   logger.info("Testerami", {
//     userId: "banana",
//     some: "other-shit",
//   });
// });

// SG_TODO Move to new file

export const scheduleCreateMobilityRoutine = onSchedule(
  {
    region: "europe-west2",
    timeZone: "Europe/London",
    schedule: "every day 00:00",
    secrets: [todoistApiKey],
  },
  async (event) => {
    logger.log("tester");
    await createMobilityRoutine({
      todoistApiKey: todoistApiKey.value(),
      logger,
    });
    logger.log("✅ Success");
  }
);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
