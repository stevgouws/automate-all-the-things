import {
  duplicateProject,
  scheduleTaskByTag,
} from "../../controllers/todoistController.js";
import { TodoistService } from "../../services/TodoistService.js";

export const createMobilityRoutine = async ({
  todoistApiKey = process.env.TODOIST_API_KEY,
  logger = console,
} = {}) => {
  const todoist = new TodoistService({ todoistApiKey });
  const projects = await todoist.getProjects();
  const templates = projects.filter((project) => project.name.startsWith("⚙️"));
  for (const template of templates) {
    logger.log(`Processing ${template.name}...`);
    const targetProjectName = template.name.replace("⚙️", "").trim();
    const oldProject = projects.find(({ name }) => name === targetProjectName);
    if (oldProject) await todoist.deleteProject(oldProject);
    const templateProject = projects.find(({ name }) => name === template.name);
    const newProject = await duplicateProject({
      sourceProjectId: templateProject.id,
      targetProjectName,
      todoist,
    });
    const tasks = await todoist.getTasks({ projectId: newProject.id });
    await Promise.all(
      tasks.map((task) => scheduleTaskByTag({ todoist, task }))
    );
    logger.log(`Created new ${targetProjectName} project`);
  }
  logger.log("Created mobility routine ✅");
};
