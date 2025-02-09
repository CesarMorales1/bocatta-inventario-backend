import { Router } from "express";
import { KardexProductoController } from "../controllers/KardexProductoController.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";

const prisma = getPrismaInstance();
const kardexProductoRouter = Router();
const kardexProductoController = new KardexProductoController(prisma);

// POST - Procesar archivo de ventas
kardexProductoRouter.post('/kardex-producto/ventas', 
    kardexProductoController.procesarArchivoVentas
);

// POST - Crear nuevo movimiento en kardex
kardexProductoRouter.post('/kardex-producto', 
    kardexProductoController.createOneKardex
);

// GET - Obtener todos los movimientos de kardex
kardexProductoRouter.get('/kardex-productos', 
    kardexProductoController.getAllKardex
);

// GET - Obtener movimientos de kardex por producto
kardexProductoRouter.get('/kardex-producto/producto/:id_producto', 
    kardexProductoController.getKardexByProduct
);

// GET - Obtener un movimiento específico de kardex
kardexProductoRouter.get('/kardex-producto/:id_kardex', 
    kardexProductoController.obtenerKardexPorReferencia
);

// GET - Obtener un registro de kardex por referencia
kardexProductoRouter.get('/kardex-producto-referencia/:referencia', 
    kardexProductoController.obtenerKardexPorReferencia
);

export default kardexProductoRouter;