import { TodoistApi } from "@doist/todoist-api-typescript";

export class TodoistService {
  constructor({ todoistApiKey } = {}) {
    this.todoist = new TodoistApi(todoistApiKey);
  }

  async getProjects() {
    return this.todoist.getProjects();
  }

  async getProject(id) {
    return this.todoist.getProject(id);
  }

  async addProject(project) {
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

  async getTasks(whatevs) {
    return this.todoist.getTasks(whatevs);
  }

  async deleteProject(project) {
    return this.todoist.deleteProject(project.id);
  }

  async deleteAllProjects() {
    if (process.env.NODE_ENV !== "test") {
      throw new Error(
        "You're trying to delete all projects outside of test... you probably didn't mean to do that. You're welcome."
      );
    }
    const projects = await this.getProjects();
    await Promise.all(projects.map((project) => this.deleteProject(project)));
  }
}
// SG_TODO clean up service & add logging
