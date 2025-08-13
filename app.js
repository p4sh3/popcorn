import express from "express";
import cors from "cors";
import compression from "compression";

import { moviesRouter } from "./routes/movies.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { morganMiddleware } from "./middleware/morgan.middleware.js";

export const app = express();

app.use(morganMiddleware);
app.use(cors());
app.use(compression());
const PORT = process.env.PORT ?? 3000;

app.use("/api/movies", moviesRouter);

app.use(errorHandler);

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

// Handle unhandled promise rejections (async errors outside Express)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
