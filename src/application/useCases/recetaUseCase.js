import {CommonCrudMixing} from "./genericUseCase.js"

export class RecetaUseCase extends CommonCrudMixing
{
    constructor(productUseCaseRepository)
    {
        super({
            database : productUseCaseRepository,
            tableName : 'receta',
        })
    }

    async addOne({productId,ingredientId,cantidad})
    {
        return await super.addOne({producto_id: productId,ingrediente_id: ingredientId,cantidad:cantidad});
    }
}