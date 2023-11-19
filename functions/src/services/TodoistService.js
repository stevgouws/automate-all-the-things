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
}
