import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../models/User";

class UserController {
    async create(request: Request, response: Response) {
        const {name, email} = request.body;

        const usersRepository = getRepository(User);

        // select * from users where email = email    
        const userAlredyExists = await usersRepository.findOne({
            email
        });

        if(userAlredyExists){
            return response.status(400).json({
                error: "Usuario ja existente!"
            });
        }

        const user = usersRepository.create({
            name,
            email
        })

        await usersRepository.save(user);

        return response.json(user);
    }
}

export { UserController }