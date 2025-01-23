import { Router } from "express";
import { RecetaController } from "../controllers/recetaController.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const recetaRouter = Router();
const recetaController = new RecetaController(prisma);

// POST - Crear recetas desde un producto
recetaRouter.post('/receta', 
    recetaController.createFromProduct
);


recetaRouter.get('/receta',
    recetaController.getAllReceta,
)

//creando ruta para actualizar las recetas
// recetaRouter.put('/receta', 
//     recetaController.updateOneReceta
// )


// recetaRouter.delete('/receta-producto',(req,res,next) => 
//     {
//         console.log(req.body);
//     })

export default recetaRouter;
