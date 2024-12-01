document.addEventListener("DOMContentLoaded", function () {
  const openDialogButton = document.getElementById("open-dialog-btn");
  const taskDialog = document.getElementById("task-dialog");
  const closeDialogButton = document.getElementById("close-dialog-btn");
  const submitTaskBtn = document.getElementById("submit-task-btn");
  const taskInput = document.getElementById("task-input");
  const taskDateInput = document.getElementById("task-date-input");
  const taskStartTimeInput = document.getElementById("task-start-time-input");
  const taskEndTimeInput = document.getElementById("task-end-time-input");
  const todoColumn = document.getElementById("todo-column");
  const inProgressColumn = document.getElementById("in-progress-column");
  const doneColumn = document.getElementById("done-column");
  const exportCalendarButton = document.getElementById("export-calendar-btn");

  const tasksData = JSON.parse(localStorage.getItem("tasksData")) || {
    todo: [],
    inProgress: [],
    done: [],
  };

  function renderTasks() {
    todoColumn.innerHTML = "<h2>Задачи</h2>";
    inProgressColumn.innerHTML = "<h2>В процессе</h2>";
    doneColumn.innerHTML = "<h2>Выполнены</h2>";

    tasksData.todo.forEach((task) => createTaskElement(task, todoColumn, "todo"));
    tasksData.inProgress.forEach((task) =>
      createTaskElement(task, inProgressColumn, "inProgress")
    );
    tasksData.done.forEach((task) => createTaskElement(task, doneColumn, "done"));
  }

  function createTaskElement(task, parentColumn, status) {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    if (status === "done") {
      taskItem.classList.add("completed");
    }

    const dateText = task.date ? ` (Дата: ${task.date})` : "";
    const timeText = task.startTime && task.endTime ? ` (Время: ${task.startTime} - ${task.endTime})` : "";

    taskItem.innerHTML = `
      <input type="checkbox" ${status === "done" ? "checked" : ""} />
      <p class="task-content task-text">${task.text}${dateText}${timeText}</p>
      <div class="task-actions">
        <button class="button delete-btn">Удалить</button>
      </div>
    `;

    parentColumn.appendChild(taskItem);

    const checkbox = taskItem.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => handleTaskStatusChange(task, status));

    const deleteBtn = taskItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => handleTaskDelete(task, status));
  }

  function handleTaskStatusChange(task, currentStatus) {
    let newStatus;

    if (currentStatus === "todo") {
      newStatus = "inProgress";
    } else if (currentStatus === "inProgress") {
      newStatus = "done";
    } else {
      return;
    }

    tasksData[currentStatus] = tasksData[currentStatus].filter((t) => t !== task);
    tasksData[newStatus].push(task);

    localStorage.setItem("tasksData", JSON.stringify(tasksData));
    renderTasks();
  }

  function handleTaskDelete(task, status) {
    tasksData[status] = tasksData[status].filter((t) => t !== task);
    localStorage.setItem("tasksData", JSON.stringify(tasksData));
    renderTasks();
  }

  openDialogButton.addEventListener("click", () => {
    taskDialog.showModal();
  });

  closeDialogButton.addEventListener("click", () => {
    taskDialog.close();
  });

  submitTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    const taskDate = taskDateInput.value;
    const taskStartTime = taskStartTimeInput.value;
    const taskEndTime = taskEndTimeInput.value;

    if (!taskText || !taskDate || !taskStartTime || !taskEndTime) {
      console.error("Текст задачи, дата и время обязательны.");
      return;
    }

    tasksData.todo.push({
      text: taskText,
      date: taskDate,
      startTime: taskStartTime,
      endTime: taskEndTime
    });
    localStorage.setItem("tasksData", JSON.stringify(tasksData));

    renderTasks();
    taskInput.value = "";
    taskDateInput.value = "";
    taskStartTimeInput.value = "";
    taskEndTimeInput.value = "";
    taskDialog.close();
  });

  taskDialog.addEventListener("click", (event) => {
    const dialogBounds = taskDialog.getBoundingClientRect();
    if (
      event.clientX < dialogBounds.left ||
      event.clientX > dialogBounds.right ||
      event.clientY < dialogBounds.top ||
      event.clientY > dialogBounds.bottom
    ) {
      taskDialog.close();
    }
  });

  function generateICS(tasks) {
    let calendarContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//YourApp//TaskList//EN\n";

    const now = new Date().toISOString().replace(/-|:|\.\d+/g, "");
    tasks.forEach((task, index) => {
      const eventUID = `task-${index}-${now}`;
      const dtstamp = now;

      const taskDate = task.date.replace(/-/g, ""); // Убираем дефисы
      const taskStartTime = task.startTime.replace(":", "") + "00"; // Преобразуем время начала в формат HHMMSS
      const taskEndTime = task.endTime.replace(":", "") + "00"; // Преобразуем время окончания в формат HHMMSS

      const dtstart = `${taskDate}T${taskStartTime}`; // Формат начала события
      const dtend = `${taskDate}T${taskEndTime}`; // Формат окончания события

      const status = task.status || "Неизвестный статус"; // Статус задачи

      let category = "Без категории";
      if (task.status === "Задачи") {
        category = "Задачи";
      } else if (task.status === "В процессе") {
        category = "В процессе";
      } else if (task.status === "Выполнены") {
        category = "Выполнены";
      }

      calendarContent += `BEGIN:VEVENT\n`;
      calendarContent += `UID:${eventUID}\n`;
      calendarContent += `DTSTAMP:${dtstamp}\n`;
      calendarContent += `DTSTART:${dtstart}\n`;
      calendarContent += `DTEND:${dtend}\n`; 
      calendarContent += `SUMMARY:${task.text}\n`;
      calendarContent += `DESCRIPTION:Статус задачи: ${status}\n`;
      calendarContent += `STATUS:CONFIRMED\n`;
      calendarContent += `CATEGORIES:${category}\n`;
      calendarContent += `END:VEVENT\n`;
    });

    calendarContent += "END:VCALENDAR\n";

    return calendarContent;
  }

  function downloadICSFile(content, filename) {
    const blob = new Blob([content], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportCalendarButton.addEventListener("click", () => {
    const allTasks = [
      ...tasksData.todo.map(task => ({ ...task, status: "Задачи" })),
      ...tasksData.inProgress.map(task => ({ ...task, status: "В процессе" })),
      ...tasksData.done.map(task => ({ ...task, status: "Выполнены" })),
    ];

    if (allTasks.length === 0) {
      alert("Нет задач для экспорта.");
      return;
    }

    const icsContent = generateICS(allTasks);
    downloadICSFile(icsContent, "tasks_calendar.ics");
  });

  renderTasks();
});
//