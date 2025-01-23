import app from "express";
import {IngredienteUseCase} from "../.././../application/useCases/ingredienteUseCase.js"
import { MatrizUseCase } from "../../../application/useCases/matrizUseCase.js";
import {ProductUseCase} from "../../../application/useCases/productoUseCase.js"
const routerViews = app.Router();
const ingredientes = new IngredienteUseCase();
const matriz       = new MatrizUseCase()
const productos    = new ProductUseCase() 

//se puede mejorar pero no hay tiempo
const matrizInformation = async (ingredienteUseCase, matrizUseCase) => {
    const matrizInfo = await matrizUseCase.getData();

    // Resolvemos todas las promesas generadas por map usando Promise.all
    const information = await Promise.all(
        matrizInfo.map(async item => {
            const ingrediente = await ingredienteUseCase.getFilterData({ id: item.ingrediente_id });

            return {
                id: ingrediente.at(0).codigo_barras,
                nombre: ingrediente.at(0).nombre,
                cantidad: item.cantidad_existencia
            };
        })
    );

    return information; // Devolvemos el array resuelto
};


//
//ruta para renderizar la vista principal
routerViews.get(`/${process.env.ROUTE_VERSION}/`, async (req, res) => {
    const dataToSend = await matrizInformation(ingredientes,matriz); // Obtén los datos
    res.render('index', { dataToSend }); // Envíalos como una clave-valor
});
//edit del ingrediente
routerViews.get(`/${process.env.ROUTE_VERSION}/add`, async (req, res) => {
    
    let data = await ingredientes.getData();
    console.log(data);

    // Mapear los datos y esperar a que todas las promesas se resuelvan
    data = await Promise.all(
        data.map(async (item) => {
            const result = await matriz.getFilterData({ ingrediente_id: item.id });
            return {id:item.codigo_barras,nombre:item.nombre,stock:result.at(0).cantidad_existencia}
        })
    );
    
    res.render('ingredient/addIngredient', { data });
});

routerViews.get(`/${process.env.ROUTE_VERSION}/edit`, async (req, res) => {
    const { id } = req.query;
    const ingredient = await (await ingredientes.getFilterData({ codigo_barras: id })).at(0);
    ingredient.unidades = await (await matriz.getFilterData({ingrediente_id: ingredient.id})).at(0).cantidad_existencia
    // Pasar el objeto ingredient completo a la vista
    res.render('ingredient/editIngredient', { ingredient });
});

routerViews.get(`/${process.env.ROUTE_VERSION}/addIngredient`,async (req,res) =>
    {
        const ingredient = {};
        res.render('ingredient/createIngredient',{ingredient})
    })

//Productos

routerViews.get(`/${process.env.ROUTE_VERSION}/productos`,async (req,res) =>
    {
        const dataToSend = await productos.getData();
        res.render('producto/index',{dataToSend});
    })

routerViews.get(`/${process.env.ROUTE_VERSION}/productosAdd`,async (req,res) =>
    {
        const ingredients = await ingredientes.getData();
        res.render('producto/addProducto',{ingredients});
    })



export default routerViews;