import {
  duplicateProject,
  scheduleTaskByTag,
  scheduleTaskForToday,
} from "../../controllers/todoistController.js";
import { TodoistService } from "../../services/TodoistService.js";
import { logger } from "../../services/LoggerService";

export const createMobilityRoutine = async ({
  todoistApiKey = process.env.TODOIST_API_KEY,
} = {}) => {
  const todoist = new TodoistService({ todoistApiKey });
  await createBaseMobilityRoutine({ todoist, logger });
  // await scheduleRandomTasks({
  //   todoist,
  //   logger,
  //   filter: "#Mobility & /Move",
  //   numberOfTasks: 2,
  // });
  // await scheduleRandomTasks({
  //   todoist,
  //   logger,
  //   filter: "#Exercise & /Mobilise",
  //   numberOfTasks: 1,
  // });
  logger.info("Created mobility routine ✅");
};

async function createBaseMobilityRoutine({ todoist, logger }) {
  const projects = await todoist.getProjects();
  const templates = projects.filter((project) => project.name.startsWith("⚙️"));
  for (const template of templates) {
    logger.info(`Processing ${template.name}...`);
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
    logger.info(`Created new ${targetProjectName} project`);
  }
}

async function scheduleRandomTasks({ todoist, logger, filter, numberOfTasks }) {
  const movementTasks = await todoist.getTasks({ filter });
  const randomTasksSelection = movementTasks
    .sort(() => Math.random() - 0.5)
    .slice(0, numberOfTasks);
  for (const task of randomTasksSelection) {
    await scheduleTaskForToday({ todoist, task });
    logger.info(`Scheduled ${task.content} for today`);
  }
}
