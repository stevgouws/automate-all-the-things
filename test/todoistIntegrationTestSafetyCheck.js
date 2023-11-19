import { expect } from "chai";
import { describe, it, afterEach, before } from "mocha";
import { TODOIST_TEST_PREFIX } from "./constants.js";
import { TodoistTestService } from "./serviceWrappers/TodoistTestService.js";

describe("todoistIntegrationTestSafetyCheck", () => {
  let todoist;
  before(async () => {
    todoist = new TodoistTestService({
      todoistApiKey: process.env.TODOIST_API_KEY,
      logger: console,
    });
  });
  afterEach(async () => {
    await todoist.deleteAllIntegrationTestProjects();
  });
  it("should error when I try to create a project without the test prefix", async () => {
    await expect(todoist.addProject({ name: "Testerama" })).to.be.rejected;
  });
  it("should error when I try to delete a project without the test prefix", async () => {
    await expect(todoist.deleteProject({ name: "Testerama" })).to.be.rejected;
  });
  it("should NOT error when I try to create a project WITH the test prefix", async () => {
    await expect(
      todoist.addProject({ name: `${TODOIST_TEST_PREFIX} Testerama` })
    ).not.to.be.rejected;
  });
  it("should NOT error when I try to delete a project WITH the test prefix", async () => {
    const testProject = await todoist.addProject({
      name: `${TODOIST_TEST_PREFIX} Testerama`,
    });
    await expect(todoist.deleteProject(testProject)).not.to.be.rejected;
  });
});
