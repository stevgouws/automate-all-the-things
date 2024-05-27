/* eslint-disable import/no-relative-packages */
import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { isToday } from "date-fns";
import { createMobilityRoutine } from "../../functions/src/scripts/createMobilityRoutine/index.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

const todoist = new TodoistService({
  todoistApiKey: process.env.TODOIST_API_KEY,
});

const templateNames = ["⚙️ Mobility", "⚙️ Exercise"];

describe("createMobilityRoutine", () => {
  describe("for each project that starts with the gear emoji", () => {
    beforeEach(async () => {
      for (const templateName of templateNames) {
        const targetProjectName = templateName.replace("⚙️", "").trim();
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
        const targetProjectName = templateName.replace("⚙️", "").trim();
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
  describe("given that there is a 'Mobility' project with a 'Move' section", () => {
    beforeEach(async () => {
      const project = await todoist.addProject({
        name: "Mobility",
      });
      const moveSection = await todoist.addSection({
        name: "Move",
        projectId: project.id,
      });
      await todoist.addTask({
        content: "Task 1",
        description: "Task 1 description",
        projectId: project.id,
        sectionId: moveSection.id,
      });
      await todoist.addTask({
        content: "Task 2",
        description: "Task 2 description",
        projectId: project.id,
        sectionId: moveSection.id,
      });
      await todoist.addTask({
        content: "Task 3",
        description: "Task 3 description",
        projectId: project.id,
        sectionId: moveSection.id,
      });
      await todoist.addTask({
        content: "Task 4",
        description: "Task 4 description",
        projectId: project.id,
        sectionId: moveSection.id,
      });
    });
    afterEach(async () => {
      await todoist.deleteAllProjects();
    });
    it("should schedule 3 random tasks for today", async () => {
      await createMobilityRoutine();
      const tasks = await todoist.getTasks({ filter: "#Mobility & /Move" });
      const todayTasks = tasks.filter(({ due }) => {
        if (!due) return false;
        return isToday(new Date(due.date));
      });
      expect(todayTasks).to.have.lengthOf(3);
    });
  });
  describe("given that there is a 'Exercise' project with a 'Mobilise' section", () => {
    beforeEach(async () => {
      const project = await todoist.addProject({
        name: "Exercise",
      });
      const mobiliseSection = await todoist.addSection({
        name: "Mobilise",
        projectId: project.id,
      });
      await todoist.addTask({
        content: "Task 1",
        description: "Task 1 description",
        projectId: project.id,
        sectionId: mobiliseSection.id,
      });
      await todoist.addTask({
        content: "Task 2",
        description: "Task 2 description",
        projectId: project.id,
        sectionId: mobiliseSection.id,
      });
    });
    afterEach(async () => {
      await todoist.deleteAllProjects();
    });
    it("should schedule 1 random task for today", async () => {
      await createMobilityRoutine();
      const tasks = await todoist.getTasks({ filter: "#Exercise & /Mobilise" });
      const todayTasks = tasks.filter(({ due }) => {
        if (!due) return false;
        return isToday(new Date(due.date));
      });
      expect(todayTasks).to.have.lengthOf(1);
    });
  });
});
