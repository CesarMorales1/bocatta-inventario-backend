import {ProveedorUseCase} from "../../application/useCase/proveedor.js"
import {ResponseApi} from "../../domain/entities/apiResponse.js"
import { Proveedor } from "../../domain/entities/Proveedor.js";
export class ProveedorController
{
    constructor(database)
    {
        this.proveedorUseCase = new ProveedorUseCase({database});
    }

     createOneProveedor = async(req,res,next) => 
    {
       try {
         const newProveedor = req.body;
         const result = await this.proveedorUseCase.createOne(newProveedor);
         const response = ResponseApi.successfulRequest(null,'El proveedor ah sido creado con exito');
         res.status(response.httpCode).json(response);
         return;
       } catch (error) {
        console.log(error);
         res.status(error.httpCode).json(error);
       }
    }
    //hacer borrado mecanico porque los proveedores estan ligados a una factura
    deleteOneProveedor = async(req,res,next) => 
      {
        try {
          const {id_proveedor: referenceId} = req.body;
          const result                      = await this.proveedorUseCase.deleteOne(referenceId);
          const response                    = ResponseApi.successfulRequest(null,'El proveedor ah sido eliminado con exito');
          res.status(response.httpCode).json(response);
          return;
        } catch (error) {
          res.status(error.httpCode).json(response);
          return;
        }
      } 
    
    getAll = async(req,res,next) => 
      {
        try {
          const proveedores = await this.proveedorUseCase.getAll();
          const response =  ResponseApi.successfulRequest('Proveedores obtenidos con exito',proveedores);
          res.status(response.httpCode).json(response);
          return;
        } catch (error) {
          res.status(error.httpCode).json(error);
          return;
        }
      }

      getOne = async(req,res,next) => 
        {
          try {
            const {id_proveedor: idProveedor} = req.body
            const proveedor = await this.proveedorUseCase.getOne(Number(idProveedor));
            if(!proveedor)
              {
                //ver porque success dice true
                const response = ResponseApi.notFound('El proveedor no ah sido encontrado',null);
                res.status(response.httpCode).json(response);
                return;
              }
            const response = ResponseApi.successfulRequest('El proveedor ah sido encontrado con exito',proveedor);
            res.status(response.httpCode).json(response);
            
          } catch (error) {
            res.status(error.httpCode).json(error);
            return;
          }
        }

         updateOne = async (req, res, next) =>  {
          try {
              const { id_proveedor, ...updatedData } = req.body; // Obtenemos el ID y los datos actualizados
              if (!id_proveedor) {
                  const response = ResponseApi.badRequest('El ID del proveedor es obligatorio');
                  return res.status(response.httpCode).json(response);
              }
      
              const updatedProveedor = await this.proveedorUseCase.updateOneProveedor(id_proveedor, updatedData);
              const response = ResponseApi.successfulRequest('El proveedor ha sido actualizado con éxito', updatedProveedor);
              res.status(response.httpCode).json(response);
          } catch (error) {
              console.log(error);
              const response = ResponseApi.internalServerError(error.message);
              res.status(response.httpCode).json(response);
          }
      }
      
}