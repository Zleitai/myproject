const TASKS_KEY = "todo.tasks.v8";
const THEME_KEY = "todo.theme.v8";

export function saveTasks(tasks) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadTasks() {
    try {
        const rawTasks = localStorage.getItem(TASKS_KEY) || localStorage.getItem("tasks");
        const tasks = JSON.parse(rawTasks || "[]");
        return Array.isArray(tasks) ? tasks : [];
    } catch {
        return [];
    }
}

export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}

export function loadTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
}
