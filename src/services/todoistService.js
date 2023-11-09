import { TodoistApi } from "@doist/todoist-api-typescript";
import { TODOIST_TEST_PREFIX } from "../../test/constants.js";

class TodoistService {
  constructor() {
    this.todoist = new TodoistApi(process.env.TODOIST_API_KEY);
  }

  async getProjects() {
    return this.todoist.getProjects();
  }

  async getProject(id) {
    return this.todoist.getProject(id);
  }

  async addProject(project) {
    this.#integrationTestSafetyCheck(project.name);
    return this.todoist.addProject(project);
  }

  async addSection(section) {
    return this.todoist.addSection(section);
  }

  async getSections(projectId) {
    return this.todoist.getSections(projectId);
  }

  async addTask(task) {
    return this.todoist.addTask(task);
  }

  async getTasks({ projectId, sectionId, label, filter, lang, ids }) {
    return this.todoist.getTasks({
      projectId,
      sectionId,
      label,
      filter,
      lang,
      ids,
    });
  }

  async deleteProject(project) {
    this.#integrationTestSafetyCheck(project.name);
    return this.todoist.deleteProject(project.id);
  }

  #integrationTestSafetyCheck(projectName) {
    if (process.env.NODE_ENV !== "test") return;
    if (!projectName.includes(TODOIST_TEST_PREFIX)) {
      throw new Error(
        `Project name must contain ${TODOIST_TEST_PREFIX} prefix during testing`
      );
    }
  }
}

export const todoist = new TodoistService();
