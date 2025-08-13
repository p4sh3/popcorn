import { Router } from "express";
import { MovieController } from "../controllers/movies.controller.js";
export const moviesRouter = Router();

moviesRouter.get("/test", (req, res) => res.send("Hello World"));
moviesRouter.get("/", MovieController.getAll.bind(MovieController));
moviesRouter.get(
  "/:name/schedules",
  MovieController.getMovieSchedules.bind(MovieController)
);
