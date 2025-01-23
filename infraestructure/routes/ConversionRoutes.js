import { Router } from "express";
import { ConversionFactorController } from "../controllers/conversionFactor.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const conversionFactorRouter = Router();
const conversionFactorController = new ConversionFactorController(prisma);

// GET - Obtener todos los factores de conversión
conversionFactorRouter.get('/factoresConversion', 
    conversionFactorController.getAllConversionFactors
);

export default conversionFactorRouter;