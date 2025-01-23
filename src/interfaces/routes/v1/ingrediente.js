import expres from "express";
import {IngredienteController} from "../../controllers/ingredienteController.js"
const ingredienteController = new IngredienteController();


const ingredienteRouter = expres.Router();
//Metodos get
ingredienteRouter.get('/',(req,res) => ingredienteController.getAllIngredientes(req,res));
//Metodos post
ingredienteRouter.post('/',(req,res) => ingredienteController.addIngrediente(req,res));
//Metodos delete
ingredienteRouter.delete('/',(req,res) => ingredienteController.deleteIngrediente(req,res))
//Metodos put
// Rutas PUT
ingredienteRouter.put('/', (req, res) => ingredienteController.updateIngrediente(req, res));

export default ingredienteRouter;