import {
  duplicateProject,
  scheduleTaskByTag,
} from "../../controllers/todoistController.js";
import { TodoistService } from "../../services/TodoistService.js";

export const createMobilityRoutine = async ({
  todoistApiKey = process.env.TODOIST_API_KEY,
  logger = console,
  templateNames = [],
} = {}) => {
  const todoist = new TodoistService({ todoistApiKey });
  const projects = await todoist.getProjects();
  for (const templateName of templateNames) {
    logger.log(`Processing ${templateName}...`);
    const targetProjectName = templateName.replace(" Template", "");
    const oldProject = projects.find(({ name }) => name === targetProjectName);
    if (oldProject) await todoist.deleteProject(oldProject);
    const templateProject = projects.find(({ name }) => name === templateName);
    const newProject = await duplicateProject({
      sourceProjectId: templateProject.id,
      targetProjectName,
      todoist,
    });
    const tasks = await todoist.getTasks({ projectId: newProject.id });
    await Promise.all(
      tasks.map((task) => scheduleTaskByTag({ todoist, task }))
    );
    logger.log("Created mobility routine ✅");
  }
};
