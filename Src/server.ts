import cors from "cors";
import express from "express";
import connectDB from "./configs/Connection";
import environment from "./configs/Environment";
import router from "./routes/Index.Route";

const app = express();
app.use(
  express.json({
    limit: "50mb",
  }),
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  cors({
    origin: environment.corsOrigin,
  }),
);

app.get("/", (_, res) => {
  res.send("Helo from server side;");
});

app.use(router);

const port = environment.port;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
  });
});
