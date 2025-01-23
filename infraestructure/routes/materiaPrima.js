import { Router } from "express";
import { MateriaPrimaController } from "../controllers/materiaPrima.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";
import {createMateriaPrimaValidation, singleMateriaPrimaValidation, updateMateriaPrimaValidation } from "../validators/materiaPrimaValidator.js";

const materiaPrimaRouter = Router();
const prisma             = getPrismaInstance();
const controller         = new MateriaPrimaController(prisma);
//post
materiaPrimaRouter.post('/materiaPrima',createMateriaPrimaValidation,controller.createOneMateriaPrima);
//get
materiaPrimaRouter.post('/singleMateriaPrima',controller.getOneMateriaPrima);
materiaPrimaRouter.get('/materiaPrima',controller.getAllMateriaPrima);
//put
materiaPrimaRouter.put('/materiaPrima',controller.updateOneMateriaPrima);
//delete logico
materiaPrimaRouter.delete('/materiaPrima',singleMateriaPrimaValidation,controller.deleteOneMateriaPrima);

export default materiaPrimaRouter;