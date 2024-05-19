/* eslint-disable import/no-relative-packages */
import { expect } from "chai";
import { describe, it, beforeEach, afterEach, before, after } from "mocha";
import sinon from "sinon";
// import * as dateFns from "date-fns";
import { scheduleTaskByTag } from "../../functions/src/controllers/todoistController.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

const todoist = new TodoistService({
  todoistApiKey: process.env.TODOIST_API_KEY,
});

describe("scheduleTaskByTag", () => {
  const sourceProject = {
    color: "charcoal",
    name: "Mobility",
    viewStyle: "list",
  };
  let sourceProjectId;
  const todayStr = "2024-01-01"; // Mon
  before(async () => {
    ({ id: sourceProjectId } = await todoist.addProject({
      name: sourceProject.name,
    }));
    sinon.useFakeTimers(new Date(todayStr));
  });
  after(async () => {
    await todoist.deleteAllProjects();
  });
  describe("given that a task has a label that matches the current day", () => {
    let taskBefore;
    beforeEach(async () => {
      taskBefore = await todoist.addTask({
        content: "Exercise",
        description: "Task 1 description",
        projectId: sourceProjectId,
        labels: ["Mon"],
      });
    });
    afterEach(async () => {
      sinon.restore();
    });
    it("should schedule the task as due for today", async () => {
      const taskAfter = await scheduleTaskByTag({ todoist, task: taskBefore });
      expect(taskAfter.due.date).to.equal(todayStr);
    });
  });
  describe("given that a task has a label that doesn't match the current day", () => {
    let taskBefore;
    beforeEach(async () => {
      taskBefore = await todoist.addTask({
        content: "Exercise",
        description: "Task 1 description",
        projectId: sourceProjectId,
        labels: ["Tue"],
      });
    });
    afterEach(async () => {
      sinon.restore();
    });
    it("should not do anything", async () => {
      const taskAfter = await scheduleTaskByTag({ todoist, task: taskBefore });
      expect(taskAfter).to.deep.equal(taskBefore);
    });
  });
  describe("given that a task doesn't have a label", () => {
    let taskBefore;
    beforeEach(async () => {
      taskBefore = await todoist.addTask({
        content: "Exercise",
        description: "Task 1 description",
        projectId: sourceProjectId,
      });
    });
    it("should not do anything", async () => {
      const taskAfter = await scheduleTaskByTag({ todoist, task: taskBefore });
      expect(taskAfter).to.deep.equal(taskBefore);
    });
  });
});
