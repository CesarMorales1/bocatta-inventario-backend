import { Router } from "express";
import { FacturaController } from "../controllers/facturaController.js";
// import { facturaValidation, facturaIdValidation } from "../validators/facturaValidator.js";
import { getPrismaInstance } from "../database/singletonPrisma.js";
import path from "node:path"
import fs   from "node:fs"

const prisma = getPrismaInstance();
const facturaRouter = Router();
const facturaController = new FacturaController(prisma);

// POST - Crear nueva factura
facturaRouter.post('/factura', 
    facturaController.createOneFactura
);

// GET - Obtener todas las facturas
facturaRouter.get('/facturas', 
    facturaController.getAllFacturas
);

// GET - Obtener una factura específica
facturaRouter.get('/factura/:id_factura', 
    facturaController.getOneFactura
);

// GET - Lista de archivos de facturas
// GET - Lista de archivos de facturas
facturaRouter.get('/facturas/list', async (req, res) => {
    try {
        // const facturasDir = path.join(process.cwd(), 'facturas');
        const facturasDir = 'C:/Users/Cesar Morales/OneDrive/Escritorio/project/facturas';
        // Leer el directorio
        const files = fs.readdirSync(facturasDir);
        // Filtrar archivos que coincidan con el patrón piso.YYYYMMDD
        const validFiles = files.filter(file => {
            return /^piso\.\d{8}$/.test(file);
        });

        res.json({
            success: true,
            files: validFiles
        });
    } catch (error) {
        res.json({
            success: false,
            information: 'Error al leer el directorio de facturas'
        });
    }
});

// PUT - Actualizar una factura
facturaRouter.put('/factura/:id_factura', 
    facturaController.updateOneFactura
);

// DELETE - Desactivar una factura (borrado lógico)
facturaRouter.delete('/factura/:id_factura', 
    facturaController.deleteOneFactura
);

export default facturaRouter;