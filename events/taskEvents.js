const eventBus = require("./eventBus");

eventBus.on("task.created", async (task) => {
  console.log("EVENT RECEIVED: task.created");
  console.log(`Processing task asynchronously: ${task.title}`);

  // Simulate asynchronous processing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log(`ASYNC PROCESSING COMPLETED for task: ${task.title}`);
});

eventBus.on("task.updated", async (task) => {
  console.log("EVENT RECEIVED: task.updated");
  console.log(`Processing updated task asynchronously: ${task.title}`);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  console.log(`ASYNC UPDATE PROCESSING COMPLETED for task: ${task.title}`);
});

eventBus.on("task.deleted", async (task) => {
  console.log("EVENT RECEIVED: task.deleted");
  console.log(`Processing deleted task asynchronously: ${task.title}`);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`ASYNC DELETE PROCESSING COMPLETED for task: ${task.title}`);
});

console.log("Task event handlers registered");