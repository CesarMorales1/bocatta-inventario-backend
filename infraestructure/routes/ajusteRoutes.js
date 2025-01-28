import { Router } from "express";
import {AjusteController} from "../controllers/ajusteController.js"
import {getPrismaInstance} from "../database/singletonPrisma.js"

const prisma = getPrismaInstance();
const ajusteRoutes = Router();
const ajusteController = new AjusteController(prisma)

ajusteRoutes.post('/ajuste',ajusteController.createAnAjuste);

export default ajusteRoutes