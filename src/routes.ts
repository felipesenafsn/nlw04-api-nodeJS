import { Router } from "express";
import { SurveysController } from "./controllers/SurveysController";
import { UserController } from "./controllers/UserController";
import { SurveysRepository } from "./respositories/SurveysRepository";

const router = Router();

const userController = new UserController();
const surveysController = new SurveysController();

router.post('/surveys', surveysController.create);
router.get('/surveys', surveysController.show);
router.post('/users', userController.create);

export { router }