import { todoist } from "../services/todoistService.js";
import { TODOIST_TEST_PREFIX } from "../../test/constants.js";

export async function duplicateProject({ sourceProjectId, targetProjectName }) {
  const project = await todoist.getProject(sourceProjectId);
  const targetProject = await todoist.addProject({
    ...project,
    name: targetProjectName,
  });
  const sourceSections = await todoist.getSections(sourceProjectId);
  const targetSections = await Promise.all(
    sourceSections.map((section) =>
      todoist.addSection({
        ...section,
        projectId: targetProject.id,
      })
    )
  );
  await duplicateTasks({
    sourceProjectId,
    targetProject,
    sourceSections,
    targetSections,
  });
  return targetProject;
}

async function duplicateTasks({
  sourceProjectId,
  sourceSections,
  targetSections,
  targetProject,
}) {
  const sourceSectionsIdToNameMap = sourceSections.reduce((acc, section) => {
    acc[section.id] = section.name;
    return acc;
  }, {});
  const sourceTasks = await todoist.getTasks({ projectId: sourceProjectId });
  // Let's do this synchronously so we ensure task order. Otherwise Todoist overrides the order
  // based on what order the requests are received in, regardless of the order argument
  for (const sourceTask of sourceTasks) {
    const { id: targetSectionId } = targetSections.find(
      (targetSection) =>
        targetSection.name === sourceSectionsIdToNameMap[sourceTask.sectionId]
    );
    await todoist.addTask({
      ...sourceTask,
      projectId: targetProject.id,
      sectionId: targetSectionId,
    });
  }
}

export async function deleteAllIntegrationTestProjects() {
  const projects = await todoist.getProjects();
  const integrationTestProjects = projects.filter((project) =>
    project.name.includes(TODOIST_TEST_PREFIX)
  );
  await Promise.all(
    integrationTestProjects.map((project) => todoist.deleteProject(project))
  );
}
