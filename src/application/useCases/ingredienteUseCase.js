import {Ingrediente} from "../../domain/models/ingrediente.js"
import { CommonCrudMixing } from "./genericUseCase.js"
import { Prisma,PrismaClient } from "@prisma/client";
import {MatrizUseCase} from "./matrizUseCase.js"
import { HttpException } from "../../infrastructure/exceptions/dataBaseExeptions.js";
const prisma = new PrismaClient();

export class IngredienteUseCase extends CommonCrudMixing
{
    constructor(ingredienteRepository)
    {
        super({database: ingredienteRepository,
            tableName: 'Ingrediente'

        })
    }

    async addOne(entityToSave, cantidad_existencia) {
        let ingredienteCreado;
        try {
            // Crear la instancia del ingrediente a guardar
            const ingredienteToSave = new Ingrediente(entityToSave);
    
            // Guardar el ingrediente
            ingredienteCreado = await super.addOne(ingredienteToSave);
    
            // Si el ingrediente se crea correctamente, guardar en la matriz
            await new MatrizUseCase(this.database, 'matriz').addOne(ingredienteCreado, cantidad_existencia);
    
            return ingredienteCreado; // Retornar el ingrediente creado
    
        } catch (error) {
            console.error("Error al crear el ingrediente:", error.message);
    
            // Si ocurrió un error y el ingrediente fue parcialmente creado, intentar eliminarlo
            if (ingredienteCreado) {
                try {
                    await this.deleteOne(ingredienteCreado.id);
                    console.log(`Ingrediente con ID ${ingredienteCreado.id} eliminado debido a un error.`);
                } catch (deleteError) {
                    console.error("Error al eliminar el ingrediente:", deleteError.message);
                }
            }
    
            // Retornar el error para que el controlador lo maneje
            return error;
        }
    }
    

    async deleteOne(idToDelete)
    {
        const ingrediente = await this.getFilterData({codigo_barras: idToDelete.codigo_barras});
        await new MatrizUseCase(this.database, 'matriz').deleteOne({ingrediente_id:ingrediente[0].id});
        return await super.deleteOne({id: ingrediente[0].id})
    }

    async updateOne(codigoBarra,newEntity,cantidad,idAntiguo)
    {
         await super.updateOne({codigo_barras:codigoBarra},newEntity);
         const matriz = new MatrizUseCase(this.database,'matriz')
         const registroMatriz = matriz.getFilterData({ingrediente_id: idAntiguo});
         if(!(await registroMatriz).length) throw new HttpException('El ingrediente no se encuentra en el inventario',501,501,'');
         return await matriz.updateOne({ingrediente_id:idAntiguo,id:(await registroMatriz).at(0).id},{cantidad_existencia:cantidad})
    }

    async getData()
    {
        return await super.getData();
    }
}