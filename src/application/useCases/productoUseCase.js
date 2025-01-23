import {Product} from "../../domain/models/Producto.js";
import { HttpException } from "../../infrastructure/exceptions/dataBaseExeptions.js";
import {CommonCrudMixing} from "./genericUseCase.js";
import { IngredienteUseCase } from "./ingredienteUseCase.js";
import { RecetaUseCase } from "./recetaUseCase.js";

export  class ProductUseCase extends CommonCrudMixing
{
    constructor(productUseCaseRepository)
    {
        super({
            database : productUseCaseRepository,
            tableName : 'Producto',
        })
    }

    async addOne(entityToSave, ingredients) {
        const receta = new RecetaUseCase();
        let ingredientes = [];
        let productoAgregado;
        const ingredienteUseCase = new IngredienteUseCase();
        
        try {
            // Espera el resultado de la operación
            productoAgregado = await super.addOne(entityToSave);
            // Verifica que el producto agregado tenga un ID válido
            if (!productoAgregado || !productoAgregado.id) {
                throw new Error('No se pudo agregar el producto correctamente.');
            }
    
            // Encontrando ingredientes
            for (const ingredient of ingredients) {
                const ingrediente = await ingredienteUseCase.getFilterData({ id: ingredient.id });
                if (!ingrediente.length) throw new HttpException('Un ingrediente no se encuentra definido', 404, 404, '');
                ingredientes.push({ id: ingredient.id, cantidad: ingredient.cantidad, productoId: productoAgregado.id });
            }
    
            // Relacionar ingredientes con el producto en la receta
            for (const item of ingredientes) {
                await receta.addOne({ 
                    productId: item.productoId, 
                    ingredientId: item.id, 
                    cantidad: item.cantidad 
                });
            }
        } catch (error) {
    
            // Eliminar el producto agregado en caso de error
            if (productoAgregado && productoAgregado.id) {
                await super.deleteOne({ id: productoAgregado.id });
            }
            
            return error;
        }
    }
    
    updateOne(referenceInfo, updatedData) 
    {
        const productToUpdate = new Product(updatedData);
        return super.updateOne(referenceInfo, productToUpdate);
    }
      
}