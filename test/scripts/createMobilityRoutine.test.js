import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { createMobilityRoutine } from "../../functions/src/scripts/createMobilityRoutine/index.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

const todoist = new TodoistService({
  todoistApiKey: process.env.TODOIST_API_KEY,
});

describe("createMobilityRoutine", () => {
  beforeEach(async () => {
    await todoist.addProject({
      name: "Template",
    });
    await todoist.addProject({
      name: "Mobility",
    });
  });
  afterEach(async () => {
    await todoist.deleteAllProjects();
  });
  it("should copy the 'Template' project and name it 'Mobility'", async () => {
    await createMobilityRoutine();
    const projects = await todoist.getProjects();
    const mobilityProject = projects.find(({ name }) => name === "Mobility");
    expect(mobilityProject).to.exist;
  });
  it("should delete the previous 'Mobility' project if it exists", async () => {
    await createMobilityRoutine();
    const projects = await todoist.getProjects();
    const mobilityProjects = projects.filter(({ name }) => name === "Mobility");
    expect(mobilityProjects).to.have.lengthOf(1);
  });
});
