import { IngredienteUseCase } from "../../application/useCases/ingredienteUseCase.js";
import { MatrizUseCase } from "../../application/useCases/matrizUseCase.js";
import { getPrismaInstance } from "../../infrastructure/database/prismaSingleton.js";
import { Prisma, PrismaClient } from "@prisma/client";
import { Ingrediente } from "../../domain/models/ingrediente.js";
import { ResponseMessage } from "../../domain/models/responseMessage.js";
import { HttpException } from "../../infrastructure/exceptions/dataBaseExeptions.js";

const prisma = getPrismaInstance(); // Instancia de Prisma

// Crear instancia de IngredienteUseCase
const ingredienteUseCase = new IngredienteUseCase({ database: prisma, tableName: "ingrediente" });

/**
 * Controlador para gestionar ingredientes
 */
export class IngredienteController {
  /**
   * Maneja la solicitud para obtener todos los ingredientes.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async getAllIngredientes(req, res) {
    try {
      const ingredientes = await ingredienteUseCase.getData();
      res.status(200).json(ingredientes);
    } catch (error) {
      const response = new ResponseMessage({ success: false, message: error.message });
      res.status(500).json(response); // Usamos 500 si el error es genérico del servidor
    }
  }

  /**
   * Maneja la solicitud para obtener ingredientes filtrados.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async getFilteredIngredientes(req, res) {
    try {
      const { filterConditions, fieldsToRetrieve } = req.body;
      const ingredientes = await ingredienteUseCase.getFilterData(filterConditions, fieldsToRetrieve);
      res.status(200).json(ingredientes);
    } catch (error) {
      const response = new ResponseMessage({ success: false, message: error.message });
      res.status(500).json(response);
    }
  }

  /**
   * Maneja la solicitud para agregar un nuevo ingrediente.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async addIngrediente(req, res) {
    try {
      // //Ojo en el formulario los nombres deben de ser id,nombre,descripcion
      const ingrediente = new Ingrediente(req.body);
      const result = await ingredienteUseCase.addOne(ingrediente,req.body.cantidad);
      if(result instanceof HttpException) throw result;
      const response = new ResponseMessage({success: true,message: result})
      return res.status(200).json(response);
    } catch (error) {
      const response = new ResponseMessage({ success: false, message: error.message });
      return res.status(error.statusCode || 500).json(response); // Usamos el código de estado del error si está disponible
    }
  }

  /**
   * Maneja la solicitud para eliminar un ingrediente.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async deleteIngrediente(req, res) {
    try {
      const { codigo_barras } = req.body;
      const deletedIngrediente = await ingredienteUseCase.deleteOne({ codigo_barras: codigo_barras });
      res.status(200).json({sucess:true,data:deletedIngrediente});
    } catch (error) {
      const response = new ResponseMessage({ success: false, message: error.message });
      res.status(error.statusCode || 404).json(response); // Usamos 404 si no se encuentra el recurso
    }
  }

  async updateIngrediente(req,res)
  {
    try {
      console.log(req.body);
      const ingredienteViejo = await ingredienteUseCase.getFilterData({codigo_barras: req.body.codigo_barras})
      if(!ingredienteViejo.length || !req.body.cantidad){
        return res.status(401).json(new ResponseMessage({success: false,message:'El codigo de barra es inexistente o la cantidad esta vacia'}))
      }
      const {cantidad} = req.body;
      const nuevaEntidad = new Ingrediente(req.body);
      await ingredienteUseCase.updateOne(nuevaEntidad.codigo_barras,nuevaEntidad,cantidad,ingredienteViejo.at(0).id);
      return res.status(201).json(new ResponseMessage({success:true,message:"El ingrediente se ah actualizado con exito"}))
    } catch (error) {
      return res.status(error.statusCode ?? 404).json(new ResponseMessage({success: false,message: error.messsage}))
    }
  }
}

// Métodos para renderizar las vistas
export const renderIngredienteTable = async (req, res) => {
  try {
    const warehouses = await ingredienteUseCase.getData();
    res.render('ingrediente/index', { warehouses });
  } catch (error) {
    const response = new ResponseMessage({ success: false, message: error.message });
    res.status(500).json(response);
  }
};

export const renderAddIngrediente = async (req, res) => {
  try {
    const productData = !req.query.id ? {} : await (await ingredienteUseCase.getFilterData({ id: Number(req.query.id) })).at(0);
    const matriz = new MatrizUseCase(prisma);
    productData.units = (await matriz.getFilterData({ ingrediente_id: Number(productData.id) })).at(0).cantidad_existencia;
    res.render('ingrediente/addIngrediente', { productData });
  } catch (error) {
    const response = new ResponseMessage({ success: false, message: error.message });
    res.status(500).json(response);
  }
};
