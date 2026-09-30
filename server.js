const express = require("express");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
const cache = require("./cache/cache");
const eventBus = require("./events/eventBus");

require("./events/taskEvents");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

function invalidateTaskCache() {
  cache.del("all_tasks");
}

app.get("/", (req, res) => {
  res.json({
    message: "ITUE301 Practical 9 Task Manager API",
    endpoints: [
      "GET /tasks",
      "GET /tasks/:id",
      "POST /tasks",
      "PUT /tasks/:id",
      "DELETE /tasks/:id",
      "DELETE /cache"
    ]
  });
});

// GET all tasks - cached for 60 seconds
app.get("/tasks", async (req, res) => {
  try {
    const cached = cache.get("all_tasks");

    if (cached) {
      console.log("CACHE HIT - /tasks");
      return res.json(cached);
    }

    console.log("CACHE MISS - /tasks");
    const tasks = await Task.find().sort({ createdAt: -1 });

    cache.set("all_tasks", tasks);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET single task - separate cache key
app.get("/tasks/:id", async (req, res) => {
  try {
    const key = `task_${req.params.id}`;
    const cached = cache.get(key);

    if (cached) {
      console.log(`CACHE HIT - ${key}`);
      return res.json(cached);
    }

    console.log(`CACHE MISS - ${key}`);
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    cache.set(key, task);
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID" });
  }
});

// POST
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

const task = await Task.create({
  title,
  description,
  completed
});

invalidateTaskCache();

// Publish event
eventBus.emit("task.created", task);

res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// PUT
app.put("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

invalidateTaskCache();
cache.del(`task_${req.params.id}`);

// Publish event
eventBus.emit("task.updated", task);

res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID or data" });
  }
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
  try {
const task = await Task.findByIdAndDelete(req.params.id);

if (!task) {
  return res.status(404).json({ error: "Task not found" });
}

invalidateTaskCache();
cache.del(`task_${req.params.id}`);

// Publish event
eventBus.emit("task.deleted", task);

res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Invalid task ID" });
  }
});

// Manual cache clear for demonstration
app.delete("/cache", (req, res) => {
  cache.flushAll();
  res.json({ message: "All cache entries cleared" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
