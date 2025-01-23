import {CommonCrudMixin} from "./genericUseCase.js"
export class KardexMateriaPrima extends CommonCrudMixin
{
    constructor(database)
    {
        super({database: database,tableName:'kardex_materia_prima'});
    }

    async getAll()
    {
        try {
            const result = this.database[`${this.tableName}`].findMany({
                select: {
                    id_kardex: true,
                    id_materia_prima: true,
                    tipo_movimiento: true,
                    cantidad: true,
                    saldo: true,
                    costo_unitario: true,
                    costo_total: true,
                    fecha_movimiento: true,
                    referencia: true,
                    observaciones: true,
                    materia_prima: {
                        select: {
                            nombre: true
                        }
                    }
                }
            })
            return result;
        } catch (error) {
            throw error;   
        }
    }
} 