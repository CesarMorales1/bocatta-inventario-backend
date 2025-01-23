import { ProductUseCase } from "../../application/useCases/productoUseCase.js";
import { getPrismaInstance } from "../../infrastructure/database/prismaSingleton.js";
import { HttpException } from "../../infrastructure/exceptions/dataBaseExeptions.js";

const prisma = getPrismaInstance(); // Instancia de Prisma

// Crear instancia de ProductUseCase
const productUseCase = new ProductUseCase({ database: prisma, tableName: "producto" });

/**
 * Controlador para gestionar productos
 */
export class ProductController {
  /**
   * Maneja la solicitud para obtener todos los productos.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async getAllProducts(req, res) {
    try {
      const products = await productUseCase.getData();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Maneja la solicitud para obtener productos filtrados.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async getFilteredProducts(req, res) {
    try {
      const { filterConditions, fieldsToRetrieve } = req.body;
      const products = await productUseCase.getFilterData(filterConditions, fieldsToRetrieve);
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProducts(req, res) {
    try {
      const { id } = req.params;  // Obtiene el ID del producto desde los parámetros de la URL
      const updatedData = req.body;  // Obtiene los datos para la actualización desde el cuerpo de la solicitud
    
      // Verifica que los datos sean válidos antes de intentar actualizarlos
      if (!updatedData || Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos válidos para actualizar.' });
      }
    
      // Llamar a la función updateOne de productUseCase para actualizar el producto
      const updatedProduct = await productUseCase.updateOne({ id: Number(id) }, updatedData);
    
      // Si el producto no se encuentra, devolver un error 404
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Producto no encontrado.' });
      }
    
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  

  /**
   * Maneja la solicitud para agregar un nuevo producto.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async addProduct(req, res) {
    try {
      const {producto:newProduct,ingredientes} = req.body
      const createdProduct = await productUseCase.addOne(newProduct,ingredientes);
      if(createdProduct instanceof HttpException) throw createdProduct
      return res.status(201).json({success:true,data:createdProduct});
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Maneja la solicitud para eliminar un producto.
   * @param {object} req - Objeto de solicitud HTTP.
   * @param {object} res - Objeto de respuesta HTTP.
   */
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deletedProduct = await productUseCase.deleteOne({ id: Number(id) });
      res.status(200).json(deletedProduct);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export const renderWarehouseTable = async (req, res) => {
    const warehouses = await productUseCase.getData();

  res.render('warehouses/index', { warehouses });
};

export const renderAddProduct = async (req,res) => 
  {
    // const productData = req.query.id;
    const productData = await (await productUseCase.getFilterData({id:req.query.id})).at(0)
    res.render('warehouses/addProduct',{productData});
  } 
