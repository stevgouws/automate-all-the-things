import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import { duplicateProject } from "../../functions/src/controllers/todoistController.js";
import { TodoistService } from "../../functions/src/services/TodoistService.js";

const todoist = new TodoistService({
  todoistApiKey: process.env.TODOIST_API_KEY,
});

describe("duplicateProject", () => {
  const sourceProject = {
    color: "charcoal",
    name: "Template",
    viewStyle: "list",
  };
  let sourceProjectId;
  beforeEach(async () => {
    ({ id: sourceProjectId } = await todoist.addProject({
      name: sourceProject.name,
    }));
    const section1 = await todoist.addSection({
      name: "Section 1",
      projectId: sourceProjectId,
    });
    const section2 = await todoist.addSection({
      name: "Section 2",
      projectId: sourceProjectId,
    });
    await todoist.addTask({
      content: "Task 1",
      description: "Task 1 description",
      projectId: sourceProjectId,
      sectionId: section1.id,
    });
    await todoist.addTask({
      content: "Task 2",
      description: "Task 2 description",
      projectId: sourceProjectId,
      sectionId: section2.id,
    });
  });
  afterEach(async () => {
    await todoist.deleteAllProjects();
  });
  it("should copy the project and assign a new name", async () => {
    const targetProjectName = "Template";
    const targetProject = await duplicateProject({
      todoist,
      sourceProjectId,
      targetProjectName,
    });
    expect(targetProject.name).to.equal(targetProjectName);
    expect(targetProject.color).to.equal(sourceProject.color);
    expect(targetProject.viewStyle).to.equal(sourceProject.viewStyle);
  });
  it("should copy the project sections", async () => {
    const targetProject = await duplicateProject({
      todoist,
      sourceProjectId,
      targetProjectName: "Template Copy",
    });
    const sourceSections = await todoist.getSections(sourceProjectId);
    const targetSections = await todoist.getSections(targetProject.id);
    expect(targetSections).to.have.length(sourceSections.length);
    targetSections.forEach((targetSection, index) => {
      expect(targetSection.name).to.equal(sourceSections[index].name);
      expect(targetSection.order).to.equal(sourceSections[index].order);
    });
  });
  it("should copy the project tasks", async () => {
    const targetProject = await duplicateProject({
      todoist,
      sourceProjectId,
      targetProjectName: "Template Copy",
    });
    const sourceTasks = await todoist.getTasks({ projectId: sourceProjectId });
    const targetTasks = await todoist.getTasks({ projectId: targetProject.id });
    expect(targetTasks).to.have.length(sourceTasks.length);
    targetTasks.forEach((targetTask, index) => {
      expect(targetTask.content).to.equal(sourceTasks[index].content);
      expect(targetTask.order).to.equal(sourceTasks[index].order);
      expect(targetTask.description).to.equal(sourceTasks[index].description);
    });
  });
  it("should assign the copied tasks to the corresponding section", async () => {
    const targetProject = await duplicateProject({
      todoist,
      sourceProjectId,
      targetProjectName: "Template Copy",
    });
    const sourceTasks = await todoist.getTasks({ projectId: sourceProjectId });
    const targetTasks = await todoist.getTasks({ projectId: targetProject.id });
    const sourceSections = await todoist.getSections(sourceProjectId);
    const sourceSectionIdToNameMap = sourceSections.reduce((acc, section) => {
      acc[section.id] = section.name;
      return acc;
    }, {});
    const targetSections = await todoist.getSections(targetProject.id);
    const targetSectionsIdToNameMap = targetSections.reduce((acc, section) => {
      acc[section.id] = section.name;
      return acc;
    }, {});
    targetTasks.forEach((targetTask, index) => {
      const sourceProjectTask = sourceTasks[index];
      expect(targetSectionsIdToNameMap[targetTask.sectionId]).to.equal(
        sourceSectionIdToNameMap[sourceProjectTask.sectionId]
      );
    });
  });
});
