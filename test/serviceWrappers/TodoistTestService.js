import { TODOIST_TEST_PREFIX } from "../constants.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

export class TodoistTestService extends TodoistService {
  constructor({ todoistApiKey } = {}) {
    super({ todoistApiKey });
  }

  async addProject(project) {
    this.#integrationTestSafetyCheck(project.name);
    return super.addProject(project);
  }

  async deleteProject(project) {
    this.#integrationTestSafetyCheck(project.name);
    return super.deleteProject(project);
  }

  #integrationTestSafetyCheck(projectName) {
    if (process.env.NODE_ENV !== "test") return;
    if (!projectName.includes(TODOIST_TEST_PREFIX)) {
      throw new Error(
        `Project name must contain ${TODOIST_TEST_PREFIX} prefix during testing`
      );
    }
  }

  async deleteAllIntegrationTestProjects() {
    const projects = await this.todoist.getProjects();
    const integrationTestProjects = projects.filter((project) =>
      project.name.includes(TODOIST_TEST_PREFIX)
    );
    await Promise.all(
      integrationTestProjects.map((project) => super.deleteProject(project))
    );
  }
}
