/* eslint-disable import/no-relative-packages */
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { createMobilityRoutine } from "../../functions/src/scripts/createMobilityRoutine/index.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

const todoist = new TodoistService({
  todoistApiKey: process.env.TODOIST_API_KEY,
});

const templateNames = ["Mobility Template", "Exercise Template"];

describe("createMobilityRoutine", () => {
  describe("for each template", () => {
    beforeEach(async () => {
      for (const templateName of templateNames) {
        const targetProjectName = templateName.replace(" Template", "");
        await todoist.addProject({
          name: templateName,
        });
        await todoist.addProject({
          name: targetProjectName,
        });
      }
    });
    afterEach(async () => {
      await todoist.deleteAllProjects();
    });
    it(`should copy the project`, async () => {
      await createMobilityRoutine({ templateNames });
      const projects = await todoist.getProjects();
      for (const templateName of templateNames) {
        const targetProjectName = templateName.replace(" Template", "");
        const targetProject = projects.find(
          ({ name }) => name === targetProjectName
        );
        expect(targetProject).to.exist;
      }
    });
    it(`should delete the previous project if it exists`, async () => {
      await createMobilityRoutine({ templateNames });
      const projects = await todoist.getProjects();
      for (const templateName of templateNames) {
        const targetProjectName = templateName.replace(" Template", "");
        const targetProjects = projects.filter(
          ({ name }) => name === targetProjectName
        );
        expect(targetProjects).to.have.lengthOf(1);
      }
    });
  });
});
