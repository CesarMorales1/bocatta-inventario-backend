import { Router } from "express";
import { MonedaController } from "../controllers/moneda.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const monedaRouter = Router();
const monedaController = new MonedaController(prisma);

// POST - Crear nueva moneda
monedaRouter.post('/moneda', 
    
    monedaController.createOneMoneda
);

// GET - Obtener todas las monedas
monedaRouter.get('/monedas', 
    monedaController.getAllMonedas
);

// GET - Obtener una moneda específica
monedaRouter.get('/moneda/:id_moneda', 
    
    monedaController.getOneMoneda
);

// PUT - Actualizar una moneda (solo tasa de cambio)
monedaRouter.put('/moneda/:id_moneda', 
    monedaController.updateOneMoneda
);

// DELETE - Eliminar una moneda
monedaRouter.delete('/moneda/:id_moneda', 
    monedaController.deleteOneMoneda
);

export default monedaRouter;