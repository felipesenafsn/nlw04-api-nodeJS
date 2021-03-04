import { getCustomRepository } from "typeorm";
import { Request, Response } from "express";
import { SurveysRepository } from "../respositories/SurveysRepository";
import { SurveysUsersRepository } from "../respositories/SurveysUsersRepository";
import { UsersRepository } from "../respositories/UsersRepository";
import SendMailService from "../services/SendMailServices";
import { resolve } from "path";
import { AppError } from "../errors/AppError";

class SendMailController {
  async execute(request: Request, response: Response) {
    const { email, survey_id } = request.body;

    const userRepository = getCustomRepository(UsersRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await userRepository.findOne({ email });

    if (!user) {
      throw new AppError("User does not exists");
    }

    const survey = await surveysRepository.findOne({
      id: survey_id,
    });

    if (!survey) {
      throw new AppError("Survey does not exists!");
    }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: user.id, value: null },
      relations: ["user", "survey"],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL,
    };

    if (surveyUserAlreadyExists) {
      variables.id = surveyUserAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return response.json(surveyUserAlreadyExists);
    }
    // SALVAR AS INFORMAÇÕES NA TABELA SURVEYUSERS
    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id,
    });

    // ENVIAR EMAIL PARA O USUARIO
    await surveysUsersRepository.save(surveyUser);
    variables.id = surveyUser.id;

    await SendMailService.execute(email, survey.title, variables, npsPath);

    return response.json(surveyUser);
  }
}

export { SendMailController };
