import { startOfToday, format } from "date-fns";

export async function duplicateProject({
  sourceProjectId,
  targetProjectName,
  todoist,
}) {
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
    todoist,
  });
  return targetProject;
}

async function duplicateTasks({
  sourceProjectId,
  sourceSections,
  targetSections,
  targetProject,
  todoist,
}) {
  const sourceSectionsIdToNameMap = new Map(
    sourceSections.map(({ id, name }) => [id, name])
  );
  const sourceTasks = await todoist.getTasks({ projectId: sourceProjectId });
  // Let's do this synchronously so we ensure task order. Otherwise Todoist overrides the order
  // based on what order the requests are received in, regardless of the order argument
  for (const sourceTask of sourceTasks) {
    const targetSection = targetSections.find(
      (targetSection) =>
        targetSection.name ===
        sourceSectionsIdToNameMap.get(sourceTask.sectionId)
    );
    await todoist.addTask({
      ...sourceTask,
      projectId: targetProject.id,
      ...(targetSection && { sectionId: targetSection.id }),
    });
  }
}

export async function scheduleTaskByTag({ todoist, task }) {
  const today = startOfToday();
  const todayName = format(today, "E");
  if (!task.labels.includes("Daily") && !task.labels.includes(todayName)) {
    return task;
  }
  return todoist.updateTask(task.id, {
    dueDate: format(today, "yyyy-MM-dd"),
  });
}
