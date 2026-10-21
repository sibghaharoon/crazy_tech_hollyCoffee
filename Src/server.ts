import cors from "cors";
import express from "express";
import { createServer } from "http";
import connectDB from "./configs/Connection";
import environment from "./configs/Environment";
import errorMiddleware from "./middlewares/Error";
import router from "./routes/Route";

const app = express();
app.use(
  express.json({
    limit: "1mb",
  }),
);
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(
  cors({
    origin: environment.corsOrigin,
  }),
);

app.get("/", (_, res) => {
  res.send("Helo from server side;");
});

app.use(router);
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "NOT_FOUND",
  });
});
app.use(errorMiddleware);

const port = environment.port;
const server = createServer(app);

const startServer = async () => {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
};

const shutdown = async (signal: string) => {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    const mongoose = await import("mongoose");
    await mongoose.default.disconnect();
    process.exit(0);
  });
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

if (require.main === module) {
  void startServer().catch(() => {
    process.exitCode = 1;
  });
}

export default app;
