import { todoist } from "../services/todoistService.js";
import { duplicateProject } from "../controllers/todoistController";

const createMobilityRoutine = async () => {
  const projects = await todoist.getProjects();
  const mobilityProject = projects.find(({ name }) => name === "Template");
  await duplicateProject({
    sourceProjectId: mobilityProject.id,
    targetProjectName: "Mobility",
  });
  console.log("Created mobility routine ✅");
};

createMobilityRoutine();
