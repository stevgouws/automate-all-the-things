import {
  duplicateProject,
  scheduleTaskByTag,
  scheduleTaskForToday,
} from "../../controllers/todoistController.js";
import { TodoistService } from "../../services/TodoistService.js";

export const createMobilityRoutine = async ({
  todoistApiKey = process.env.TODOIST_API_KEY,
  logger = console,
} = {}) => {
  const todoist = new TodoistService({ todoistApiKey });
  await createBaseMobilityRoutine({ todoist, logger });
  await scheduleThreeRandomMoveTasks({ todoist, logger });
  logger.log("Created mobility routine ✅");
};

async function createBaseMobilityRoutine({ todoist, logger }) {
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
}

async function scheduleThreeRandomMoveTasks({ todoist, logger }) {
  const movementTasks = await todoist.getTasks({ filter: "#Mobility & /Move" });
  const randomMovementTasksSelection = movementTasks
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  for (const task of randomMovementTasksSelection) {
    await scheduleTaskForToday({ todoist, task });
    logger.log(`Scheduled ${task.content} for today`);
  }
}
