document.addEventListener("DOMContentLoaded", function () {
  // Объявление переменных
  const openDialogButton = document.getElementById("open-dialog-btn");
  const taskDialog = document.getElementById("task-dialog");
  const closeDialogButton = document.getElementById("close-dialog-btn");
  const submitTaskBtn = document.getElementById("submit-task-btn");
  const taskInput = document.getElementById("task-input");
  const todoColumn = document.getElementById("todo-column");
  const inProgressColumn = document.getElementById("in-progress-column");
  const doneColumn = document.getElementById("done-column");

  // Загрузка данных из localStorage
  const tasksData = JSON.parse(localStorage.getItem("tasksData")) || {
    todo: [],
    inProgress: [],
    done: [],
    comments: {},
  };

  if (!tasksData.comments) {
    tasksData.comments = {};
  }

  // Функция рендера задач
  function renderTasks() {
    // Очистка колонок
    todoColumn.innerHTML = "<h2>Задачи</h2>";
    inProgressColumn.innerHTML = "<h2>В процессе</h2>";
    doneColumn.innerHTML = "<h2>Выполнены</h2>";

    // Рендер задач
    tasksData.todo.forEach((task) => createTaskElement(task, todoColumn, "todo"));
    tasksData.inProgress.forEach((task) =>
      createTaskElement(task, inProgressColumn, "inProgress")
    );
    tasksData.done.forEach((task) => createTaskElement(task, doneColumn, "done"));
  }

  // Функция создания элемента задачи
  function createTaskElement(task, parentColumn, status) {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";
    if (status === "done") {
      taskItem.classList.add("completed");
    }

    taskItem.innerHTML = `
    <input type="checkbox" ${status === "done" ? "checked" : ""} />
    <p class="task-content task-text">${task}</p>
    <div class="task-actions">
      
      <button class="button delete-btn">Удалить</button>
    </div>
  `;
  

    parentColumn.appendChild(taskItem);

    // Обработчик изменения статуса
    const checkbox = taskItem.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => handleTaskStatusChange(task, status));

    // Обработчик удаления задачи
    const deleteBtn = taskItem.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => handleTaskDelete(task, status));

    // Обработчик открытия комментариев
    const commentBtn = taskItem.querySelector(".comment-btn");
    //commentBtn.addEventListener("click", () => openCommentModal(task));
  }

  // Функция открытия модального окна для комментариев
  function openCommentModal(task) {
    if (!task) {
      console.error("Ошибка: задача не определена.");
      return;
    }

    const commentList = document.getElementById("comment-list");
    const newCommentInput = document.getElementById("new-comment");
    const addCommentBtn = document.getElementById("add-comment-btn");
    const closeCommentModal = document.getElementById("close-comment-modal");

    // Очистка списка комментариев
    commentList.innerHTML = "";

    // Заполнение комментариев
    const comments = tasksData.comments[task] || [];
    comments.forEach((comment) => {
      const commentItem = document.createElement("div");
      commentItem.className = "comment-item";
      commentItem.textContent = comment;
      commentList.appendChild(commentItem);
    });

    // Открытие модального окна
    commentModal.showModal();

    // Обработчик добавления нового комментария
    addCommentBtn.onclick = () => {
      const commentText = newCommentInput.value.trim();
      if (!commentText) {
        console.error("Комментарий не может быть пустым.");
        return;
      }

      if (!tasksData.comments[task]) {
        tasksData.comments[task] = [];
      }
      tasksData.comments[task].push(commentText);

      // Сохранение комментариев
      localStorage.setItem("tasksData", JSON.stringify(tasksData));

      // Обновление списка комментариев
      openCommentModal(task);
      newCommentInput.value = "";
    };

    // Обработчик закрытия окна
    closeCommentModal.onclick = () => {
      commentModal.close();
    };
  }

  // Обработчик изменения статуса задачи
  function handleTaskStatusChange(task, currentStatus) {
    let newStatus;

    if (currentStatus === "todo") {
      newStatus = "inProgress";
    } else if (currentStatus === "inProgress") {
      newStatus = "done";
    } else {
      return; // Задача уже выполнена
    }

    tasksData[currentStatus] = tasksData[currentStatus].filter((t) => t !== task);
    tasksData[newStatus].push(task);

    localStorage.setItem("tasksData", JSON.stringify(tasksData));
    renderTasks();
  }

  // Обработчик удаления задачи
  function handleTaskDelete(task, status) {
    tasksData[status] = tasksData[status].filter((t) => t !== task);
    delete tasksData.comments[task]; // Удаление комментариев к задаче
    localStorage.setItem("tasksData", JSON.stringify(tasksData));
    renderTasks();
  }

  // Обработчики событий для добавления задачи
  openDialogButton.addEventListener("click", () => {
    taskDialog.showModal();
  });

  closeDialogButton.addEventListener("click", () => {
    taskDialog.close();
  });

  submitTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) {
      console.error("Задача не может быть пустой.");
      return;
    }

    tasksData.todo.push(taskText);
    tasksData.comments[taskText] = []; // Инициализация пустого массива комментариев
    localStorage.setItem("tasksData", JSON.stringify(tasksData));

    renderTasks();
    taskInput.value = "";
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

  // Первоначальный рендер задач
  renderTasks();
});
