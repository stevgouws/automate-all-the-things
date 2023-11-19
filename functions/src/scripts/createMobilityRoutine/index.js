import { duplicateProject } from "../../controllers/todoistController.js";
import { TodoistService } from "../../services/TodoistService.js";

export const createMobilityRoutine = async ({ todoistApiKey, logger }) => {
  const todoist = new TodoistService({ todoistApiKey });
  const projects = await todoist.getProjects();
  const mobilityProject = projects.find(({ name }) => name === "Mobility");
  if (mobilityProject) await todoist.deleteProject(mobilityProject);
  const templateProject = projects.find(({ name }) => name === "Template");
  await duplicateProject({
    sourceProjectId: templateProject.id,
    targetProjectName: "Mobility",
    todoist,
  });
  logger.log("Created mobility routine ✅");
};
