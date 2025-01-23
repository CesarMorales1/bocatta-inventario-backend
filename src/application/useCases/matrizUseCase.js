import {Matriz} from "../../domain/models/matriz.js"
import {CommonCrudMixing} from "./genericUseCase.js"

export class MatrizUseCase extends CommonCrudMixing
{
    constructor(matrizRepository)
    {
        super({database: matrizRepository,tableName:'matriz'})
    }
    async addOne(ingredientToSave,cantidad)
    {
        //recibiendo el ingrediente
        const {id} = ingredientToSave
        await super.addOne({ingrediente_id: id,cantidad_existencia: cantidad});
    }
    async getData()
    {
        return await super.getData();
    }

    async deleteOne({ingrediente_id})
    {
        const record = await this.getFilterData({ingrediente_id:Number(ingrediente_id)});
        return await super.deleteOne({id:record[0].id})
    }
}