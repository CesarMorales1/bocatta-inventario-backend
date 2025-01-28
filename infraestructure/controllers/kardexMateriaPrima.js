import {KardexMateriaPrima} from "../../application/useCase/kardexMateriaPrima.js"
import { ResponseApi } from "../../domain/entities/apiResponse.js"
import { AppError } from "../../domain/exeptions/AppError.js"

export class KardexMateriaPrimaController
{
    constructor(database)
    {
        this.kardexMateriaUseCase = new KardexMateriaPrima(database);
    }

    getAllKardex = async (req,res) => 
        {
            try {
                const kadexMateria = await this.kardexMateriaUseCase.getAll();
                const response = ResponseApi.successfulRequest('Kardex obtenido con exito',kadexMateria)
                res.status(response.httpCode).json(response);
            } catch (error) {
                console.log(error)
                res.status(error.httpCode).json(error);
                return;
            }
        }

        getPaginationKardex = async (req, res) => {
            try {
                const {
                    id_producto,
                    dateStart,
                    dateEnd,
                    skip,
                    take
                } = req.query

                if(!id_producto)
                    {
                        throw ResponseApi.badRequest('El id del producto es necesario revisa la peticion',null)

                    }

                    //validando valores de paginacion
                    const skipNumber = skip ? Number(skip): 0;
                    const takeNumber = take ? Number(take) : 0;

                    //validando que skip y take sean numeros validos
                    if(isNaN(skipNumber) || isNaN(takeNumber))
                        {
                            throw ResponseApi.badRequest('Los parametros skip y take no son validos',null);
                        }
            
            //arreglando fecha a formato iso
            const dateStartISO = new Date(dateStart).toISOString();
            const dateEndIso   = new Date(dateEnd).toISOString();
            //

            const filters = {
                id_producto: Number(id_producto), // Convertir a número
                dateStart: dateStartISO || null,       // Fecha inicial (si está presente)
                dateEnd: dateEndIso || null            // Fecha final (si está presente)
            };

            // Llamar al caso de uso para obtener los datos paginados y filtrados
            const { movements, total, totalSells, totalBuys } = await this.kardexMateriaUseCase.getPaginationKardex(skipNumber, takeNumber, filters);
            // Construir la respuesta
            const response = ResponseApi.successfulRequest('Movimientos obtenidos con éxito', {
                movements,
                pagination: {
                    skip: skipNumber,
                    take: takeNumber,
                    total,
                    totalSells,
                    totalBuys,
                }
            });

            // Enviar la respuesta
            res.status(response.httpCode).json(response);
                    
            } catch (error) {
                console.error(error);
                const errorResponse = error instanceof AppError ? error : new AppError();
                res.status(errorResponse.httpCode).json(errorResponse);
            }
        };
}