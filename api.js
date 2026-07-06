import { loadTasks, saveTasks } from "./storage.js";

function delay(ms = 300) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function normalizeTask(task) {
    return {
        id: task.id || crypto.randomUUID(),
        text: task.text || "",
        tag: task.tag || "默认",
        done: Boolean(task.done),
        createdAt: task.createdAt || new Date().toISOString(),
    };
}

export async function fetchTasks() {
    await delay();
    return loadTasks().map(normalizeTask);
}

export async function createTask(task) {
    await delay();

    const newTask = normalizeTask(task);
    const tasks = loadTasks().map(normalizeTask);
    const nextTasks = [newTask, ...tasks];

    saveTasks(nextTasks);
    return newTask;
}

export async function updateTask(id, changes) {
    await delay();

    const tasks = loadTasks().map(normalizeTask);
    const nextTasks = tasks.map((task) => (
        task.id === id ? normalizeTask({ ...task, ...changes }) : task
    ));

    saveTasks(nextTasks);
    return nextTasks.find((task) => task.id === id);
}

export async function deleteTask(id) {
    await delay();

    const tasks = loadTasks().map(normalizeTask);
    const nextTasks = tasks.filter((task) => task.id !== id);

    saveTasks(nextTasks);
    return id;
}

export async function replaceTasks(tasks) {
    await delay();

    const nextTasks = tasks.map(normalizeTask);
    saveTasks(nextTasks);
    return nextTasks;
}
