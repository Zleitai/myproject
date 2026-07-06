import {
    createTask,
    deleteTask,
    fetchTasks,
    replaceTasks,
    updateTask,
} from "./api.js";
import { loadTheme, saveTheme } from "./storage.js";

export class TodoApp {
    constructor() {
        this.tasks = [];
        this.isLoading = true;
        this.isSaving = false;
        this.error = "";
        this.filter = "all";
        this.search = "";
        this.cacheElements();
        this.bindEvents();
        this.applyTheme(loadTheme());
        this.render();
        this.init();
    }

    cacheElements() {
        this.form = document.getElementById("taskForm");
        this.taskInput = document.getElementById("taskInput");
        this.tagInput = document.getElementById("tagInput");
        this.searchInput = document.getElementById("searchInput");
        this.taskList = document.getElementById("taskList");
        this.emptyState = document.getElementById("emptyState");
        this.totalCount = document.getElementById("totalCount");
        this.activeCount = document.getElementById("activeCount");
        this.clearDoneButton = document.getElementById("clearDone");
        this.themeToggle = document.getElementById("themeToggle");
        this.filterButtons = [...document.querySelectorAll(".filter")];
    }

    bindEvents() {
        this.form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.addTask(this.taskInput.value, this.tagInput.value);
        });

        this.searchInput.addEventListener("input", () => {
            this.search = this.searchInput.value.trim().toLowerCase();
            this.render();
        });

        this.filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
                this.filter = button.dataset.filter;
                this.render();
            });
        });

        this.clearDoneButton.addEventListener("click", () => {
            this.clearCompletedTasks();
        });

        this.themeToggle.addEventListener("click", () => {
            const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
            this.applyTheme(nextTheme);
            saveTheme(nextTheme);
        });
    }

    async init() {
        try {
            this.tasks = await fetchTasks();
            this.error = "";
        } catch (error) {
            this.error = "任务加载失败，请刷新重试。";
        } finally {
            this.isLoading = false;
            this.render();
        }
    }

    async addTask(text, tag) {
        const cleanText = text.trim();
        const cleanTag = tag.trim() || "默认";

        if (!cleanText || this.isSaving) {
            this.taskInput.focus();
            return;
        }

        const draftTask = {
            text: cleanText,
            tag: cleanTag,
            done: false,
            createdAt: new Date().toISOString(),
        };

        this.taskInput.value = "";
        this.tagInput.value = "";
        this.taskInput.focus();
        await this.runSave(async () => {
            const savedTask = await createTask(draftTask);
            this.tasks = [savedTask, ...this.tasks];
        });
    }

    async toggle(id) {
        const task = this.tasks.find((item) => item.id === id);
        if (!task || this.isSaving) return;

        await this.runSave(async () => {
            const savedTask = await updateTask(id, { done: !task.done });
            this.tasks = this.tasks.map((item) => (
                item.id === id ? savedTask : item
            ));
        });
    }

    async delete(id) {
        if (this.isSaving) return;

        await this.runSave(async () => {
            await deleteTask(id);
            this.tasks = this.tasks.filter((task) => task.id !== id);
        });
    }

    async edit(id) {
        const task = this.tasks.find((item) => item.id === id);
        if (!task || this.isSaving) return;

        const nextText = prompt("编辑任务", task.text);
        if (nextText === null) return;

        const cleanText = nextText.trim();
        if (!cleanText) return;

        await this.runSave(async () => {
            const savedTask = await updateTask(id, { text: cleanText });
            this.tasks = this.tasks.map((item) => (
                item.id === id ? savedTask : item
            ));
        });
    }

    async clearCompletedTasks() {
        if (this.isSaving) return;

        const nextTasks = this.tasks.filter((task) => !task.done);
        await this.runSave(async () => {
            this.tasks = await replaceTasks(nextTasks);
        });
    }

    async runSave(action) {
        try {
            this.isSaving = true;
            this.error = "";
            this.render();
            await action();
        } catch (error) {
            this.error = "任务保存失败，请重试。";
        } finally {
            this.isSaving = false;
            this.render();
        }
    }

    applyTheme(theme) {
        const isDark = theme === "dark";
        document.body.classList.toggle("dark", isDark);
        this.themeToggle.textContent = isDark ? "日" : "月";
        this.themeToggle.setAttribute("aria-label", isDark ? "切换浅色模式" : "切换深色模式");
    }

    getVisibleTasks() {
        return this.tasks.filter((task) => {
            const matchesFilter =
                this.filter === "all" ||
                (this.filter === "active" && !task.done) ||
                (this.filter === "done" && task.done);
            const haystack = `${task.text} ${task.tag}`.toLowerCase();
            const matchesSearch = !this.search || haystack.includes(this.search);
            return matchesFilter && matchesSearch;
        });
    }

    render() {
        this.taskList.innerHTML = "";
        this.setControlsDisabled(this.isLoading || this.isSaving);

        if (this.isLoading) {
            this.emptyState.textContent = "正在加载任务...";
            this.emptyState.classList.add("visible");
            return;
        }

        if (this.error) {
            this.emptyState.textContent = this.error;
            this.emptyState.classList.add("visible");
        }

        const visibleTasks = this.getVisibleTasks();
        const activeTasks = this.tasks.filter((task) => !task.done).length;

        this.totalCount.textContent = `${this.tasks.length} 个任务`;
        this.activeCount.textContent = this.isSaving
            ? "正在保存..."
            : `${activeTasks} 个未完成`;
        this.clearDoneButton.disabled =
            this.isSaving || activeTasks === this.tasks.length;

        this.filterButtons.forEach((button) => {
            button.classList.toggle("active", button.dataset.filter === this.filter);
        });

        visibleTasks.forEach((task) => {
            this.taskList.appendChild(this.createTaskElement(task));
        });

        if (!this.error) {
            const emptyText = this.tasks.length
                ? "没有符合条件的任务。"
                : "还没有任务，先添加一个吧。";

            this.emptyState.textContent = emptyText;
            this.emptyState.classList.toggle("visible", visibleTasks.length === 0);
        }
    }

    setControlsDisabled(disabled) {
        this.form.querySelectorAll("input, button").forEach((element) => {
            element.disabled = disabled;
        });
        this.searchInput.disabled = disabled;
        this.filterButtons.forEach((button) => {
            button.disabled = disabled;
        });
    }

    createTaskElement(task) {
        const item = document.createElement("li");
        item.className = "task-item";

        const main = document.createElement("div");
        main.className = "task-main";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;
        checkbox.disabled = this.isSaving;
        checkbox.addEventListener("change", () => this.toggle(task.id));

        const title = document.createElement("span");
        title.className = `task-title${task.done ? " done" : ""}`;
        title.textContent = task.text;

        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = task.tag;

        main.append(checkbox, title, tag);

        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "编辑";
        editButton.disabled = this.isSaving;
        editButton.addEventListener("click", () => this.edit(task.id));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete";
        deleteButton.textContent = "删除";
        deleteButton.disabled = this.isSaving;
        deleteButton.addEventListener("click", () => this.delete(task.id));

        actions.append(editButton, deleteButton);
        item.append(main, actions);
        return item;
    }
}
