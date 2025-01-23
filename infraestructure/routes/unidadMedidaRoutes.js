import { Router } from "express";
import { UnidadMedidaController } from "../controllers/unidadMedida.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const unidadMedidaRouter = Router();
const unidadMedidaController = new UnidadMedidaController(prisma);

// POST - Crear nueva unidad de medida
unidadMedidaRouter.post('/unidad-medida', 
    // unidadMedidaValidation,
    unidadMedidaController.createOneUnidadMedida
);

// GET - Obtener todas las unidades de medida
unidadMedidaRouter.get('/unidadMedida', 
    unidadMedidaController.getAllUnidadesMedida
);

// GET - Obtener una unidad de medida específica
unidadMedidaRouter.get('/unidad-medida/:id', 
    // unidadMedidaIdValidation,
    unidadMedidaController.getOneUnidadMedida
);

export default unidadMedidaRouter;