import { Router } from "express";
import { ProductoTerminadoController } from "../controllers/productoTerminadoController.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const productoRouter = Router();
const productoController = new ProductoTerminadoController(prisma);

// POST - Crear nuevo producto
productoRouter.post('/producto', 

    productoController.createOneProducto
);

// GET - Obtener todos los productos
productoRouter.get('/productos', 
    productoController.getAllProductos
);

// GET - Obtener un producto específico
productoRouter.get('/producto/:id_producto', 

    productoController.getOneProducto
);

// PUT - Actualizar un producto
productoRouter.put('/producto/:id_producto', 
    productoController.updateOneProducto
);

// DELETE - Eliminar un producto
productoRouter.delete('/producto/:id_producto', 

    productoController.deleteOneProducto
);

export default productoRouter;