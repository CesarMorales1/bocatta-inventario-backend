import { Router } from "express";
import { ProveedorController } from "../controllers/proveedorController.js";
import { proveedorValidation, singleProveedorValidation } from "../validators/proveedorValidator.js";
import {getPrismaInstance} from "../database/singletonPrisma.js"

const prisma = getPrismaInstance();

const proveedorRouter = Router();
const proveedorController = new ProveedorController(prisma);

//post
proveedorRouter.post('/proveedor',proveedorValidation,proveedorController.createOneProveedor);
//get
proveedorRouter.get('/proveedor',proveedorController.getAll);
proveedorRouter.get('/proveedorSingle',singleProveedorValidation,proveedorController.getOne);
//put
proveedorRouter.put('/proveedor',proveedorValidation,proveedorController.updateOne)

export default proveedorRouter;