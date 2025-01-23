import { CommonCrudMixin } from "./genericUseCase.js"

export class ConversionFactorUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database: database, tableName: 'ConversionFactor' });
    }

    async getAll() {
        return await this.database[`${this.tableName}`].findMany();
    }
}