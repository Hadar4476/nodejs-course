const express = require("express");
const app = express();

const cron = require("node-cron");

cron.schedule("* * * * *", () => {
  console.log("Task is running every minute");
});

cron.schedule("0 * * * *", () => {
  console.log("Running a task every hour at the start of the hour");
});

cron.schedule("30 3 * * *", () => {
  console.log("Running a daily cleanup task at 3:30 AM");
});

cron.schedule("0 7 * * 1", () => {
  console.log(
    "Running a weekly report generation task every Monday at 7:00 AM"
  );
});

cron.schedule("0 0 1 * *", () => {
  console.log("Archiving logs on the first day of every month at midnight");
});

cron.schedule("* * * * * *", () => {
  console.log("Running every second");
});

const task = cron.schedule("* * * * *", () => {
  console.log("This task runs every minute");
});

// Start the task
task.start();

// Stop the task
setTimeout(() => {
  task.stop();
  console.log("Task stopped");
}, 5000); // Stops the task after 5 seconds

cron.schedule("0 0 * * *", () => {
  console.log("Starting database backup...");
  // Simulate backup logic
  setTimeout(() => {
    console.log("Database backup completed successfully");
  }, 2000);
});

app.listen(3000);
