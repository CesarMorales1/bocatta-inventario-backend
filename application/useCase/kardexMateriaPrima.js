import {CommonCrudMixin} from "./genericUseCase.js"
export class KardexMateriaPrima extends CommonCrudMixin
{
    constructor(database)
    {
        //TODO: crear la tecnica de la tabulacion para mejorar las peticiones
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

    async getPaginationKardex(skip, take, filters = {}) {
        try {
            // Convertir el id_producto a número
            filters.id_producto = Number(filters.id_producto);
            //revisando que la materia prima exista en la db
            const existMateriaPrima = await this.database[`materia_prima`].findUnique(
                {
                    where: {id_materia_prima: filters.id_producto},
                })
            
                if(!existMateriaPrima.id_materia_prima)
                    {
                        throw new Error('Error al obtener el producto');
                    }

            // Construir el objeto where para Prisma
            const whereClause = {
                id_materia_prima: filters.id_producto, // Filtro por id_producto
            };

            // Agregar filtro por rango de fechas si están presentes
            if (filters.dateStart && filters.dateEnd) {
                whereClause.fecha_movimiento = {
                    gte: new Date(filters.dateStart), // Fecha mayor o igual a dateStart
                    lte: new Date(filters.dateEnd)    // Fecha menor o igual a dateEnd
                };
            }

// Obtener los movimientos paginados y filtrados desde Prisma
const movements = await this.database[this.tableName].findMany({
    skip: Number(skip), // Saltar registros
    take: Number(take), // Tomar registros
    where: whereClause, // Aplicar filtros
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
    },
    orderBy: {
        fecha_movimiento: 'asc' // Ordenar por fecha en orden ascendente
    }
});

            // Obtener el total de movimientos que coinciden con los filtros
            const total = await this.database[`${this.tableName}`].count({ where: whereClause });

            const [prueba, totalBuys, totalSells] = await Promise.all([
                // Consulta agregada general
                this.database[this.tableName].aggregate({
                    where: whereClause,
                    _count: { _all: true },
                    _sum: { cantidad: true }
                }),
                
                // Consulta para entradas (compras)
                this.database[this.tableName].aggregate({
                    where: { 
                        ...whereClause,
                        tipo_movimiento: "ENTRADA" 
                    },
                    _count: { _all: true },
                    _sum: { cantidad: true }
                }),
                
                // Consulta para salidas (ventas)
                this.database[this.tableName].aggregate({
                    where: { 
                        ...whereClause,
                        tipo_movimiento: "SALIDA" 
                    },
                    _count: { _all: true },
                    _sum: { cantidad: true }
                })
            ]);

                    const {cantidad: totalOfItem} = totalSells._sum;
                    const {cantidad: totalOfBuys} = totalBuys._sum;
                    const {_all: amountSell} = prueba._count;

            // Mapear los movimientos a la entidad de dominio
            const mappedMovements = movements.map(movement => new KardexMateriaPrima(movement));

            // Devolver los movimientos y el total de registros
            return {
                movements: mappedMovements,
                total: amountSell,
                totalSells: totalOfItem,
                totalBuys: totalOfBuys
            };
        } catch (error) {
            console.error(error);
            throw new AppError('Error al obtener los movimientos del kárdex', 500);
        }
    }
} 