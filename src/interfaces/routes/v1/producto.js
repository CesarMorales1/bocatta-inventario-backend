import expres from "express";
import {ProductController,renderWarehouseTable,renderAddProduct} from "../../controllers/productController.js"
const productoController = new ProductController();


const productRoutes = expres.Router();
//Metodos get
productRoutes.get('/',(req,res) => productoController.getAllProducts(req,res));
//Metodos post
productRoutes.post('/',(req,res) => productoController.addProduct(req,res));
//Metodos delete
productRoutes.delete('/',(req,res) => productoController.deleteProduct(req,res))
//Metodos put
// Rutas PUT
productRoutes.put('/:id', (req, res) => productoController.updateProducts(req, res));
//renderizar vista
productRoutes.get('/product', renderWarehouseTable);
productRoutes.get('/createProduct',renderAddProduct);

export default productRoutes;