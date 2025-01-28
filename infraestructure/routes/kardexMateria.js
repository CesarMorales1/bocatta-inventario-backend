import {KardexMateriaPrimaController} from "../controllers/kardexMateriaPrima.js";
import {getPrismaInstance} from "../database/singletonPrisma.js"
import { Router } from "express";

const prisma = getPrismaInstance();
const kardexMateriaPrimaController = new KardexMateriaPrimaController(prisma);
const kardexMateriaRouter =  Router();

kardexMateriaRouter.get('/kardexMateria',kardexMateriaPrimaController.getAllKardex)
//ruta para obtener kardex con paginacion
kardexMateriaRouter.get('/kardexMateria/pagination',kardexMateriaPrimaController.getPaginationKardex)

export default kardexMateriaRouter;

