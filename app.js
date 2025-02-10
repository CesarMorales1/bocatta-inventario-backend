import express         from "express";
import cors            from "cors"
import morgan          from "morgan";
import proveedorRouter from "./infraestructure/routes/proveedor.js"
import materiaPrimaRouter from "./infraestructure/routes/materiaPrima.js";
import facturaRouter from "./infraestructure/routes/facturaRoutes.js";
import unidadMedidaRouter from "./infraestructure/routes/unidadMedidaRoutes.js";
import monedasRouter from "./infraestructure/routes/moneda.js"
import recetaRouter from "./infraestructure/routes/recetaRoute.js";
import conversionRouter from "./infraestructure/routes/ConversionRoutes.js"
import productoRouter from "./infraestructure/routes/productoTerminado.js";
import KardexProductoRouter from "./infraestructure/routes/KardexProductoController.js"
import kardexMateriaRouter from "./infraestructure/routes/kardexMateria.js";
import ajusteRoutes from "./infraestructure/routes/ajusteRoutes.js";
const server = express();
//variables de entorno
const __PORT = process.env.PORT || 3000;
//


//configurando servidor
server.use(cors());
server.use(express.json());
server.use(morgan('dev'));
    
//Rutas a usar
server.use(proveedorRouter);
server.use(materiaPrimaRouter);
server.use(facturaRouter);
server.use(unidadMedidaRouter);
server.use(monedasRouter)
server.use(recetaRouter)
server.use(conversionRouter)
server.use(productoRouter)
server.use(KardexProductoRouter)
server.use(kardexMateriaRouter)
server.use(ajusteRoutes)
//

//protegiendo
server.disable('x-powered-by');
//

server.listen(__PORT,()=> 
    {
        console.log(`escuchando en el puerto ${__PORT}`);
    })
