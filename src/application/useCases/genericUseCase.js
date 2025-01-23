import { getPrismaInstance } from "../../infrastructure/database/prismaSingleton.js";
import {HttpException,enumErrorCodes} from "../../infrastructure/exceptions/dataBaseExeptions.js"
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/library";
import { diccionarioPrisma } from "../../infrastructure/exceptions/diccionarioPrisma.js";
const prisma = getPrismaInstance();

const tableNameValidation = tableName => !prisma[tableName];

const executeValidations = async (functionToMake, tableName, params = {}) => {
  try {
    // TODO: Mejorar con un enum
    if (tableNameValidation(tableName)) throw new BadRequestError('La tabla no existe en la base de datos', 400);
    return await functionToMake(tableName, params);
  } catch (error) {
    console.log(error);
    if(error instanceof PrismaClientValidationError)   throw new HttpException(error.message,'',400,error.code)
    if(error instanceof PrismaClientKnownRequestError){
      throw diccionarioPrisma[error.code];
    }
  }
};

/**
 * Clase que proporciona operaciones CRUD comunes para entidades con lógica de negocio similar.
 */
export class CommonCrudMixing {
  /**
   * Constructor de la clase CommonCrudMixing.
   * @param {object} options - Opciones para inicializar la clase.
   * @param {object} options.database - Instancia de la base de datos (Prisma).
   * @param {string} options.tableName - Nombre de la tabla.
   */
  constructor({ database, tableName }) {
    this.database = database;
    this.tableName = tableName;
  }

  getRepository() {
    return this.database;
  }

  /**
   * Añade una nueva entidad a la tabla especificada.
   * @param {object} entityToSave - La entidad a guardar.
   * @returns {Promise<object>} - La entidad guardada.
   */
  async addOne(entityToSave) {
    return await this._executeDbOperation("create", { data: entityToSave });
  }

  /**
   * Obtiene todos los registros de la tabla especificada.
   * @returns {Promise<Array<object>>} - Lista de entidades.
   */
  async getData() {
    return await this._executeDbOperation("findMany");
  }

  /**
   * Actualiza una entidad en la tabla especificada.
   * @param {object} referenceInformation - Información de referencia para identificar la entidad a actualizar.
   * @param {object} updatedEntity - La entidad con los nuevos datos.
   * @returns {Promise<object>} - La entidad actualizada.
   */
  async updateOne(referenceInformation, updatedEntity) {
    return await this._executeDbOperation("update", {
      where: referenceInformation, // Identificador de la entidad a actualizar
      data: updatedEntity, // Nuevos datos para actualizar
    });
  }

  /**
   * Elimina una entidad de la tabla especificada.
   * @param {object} referenceInformation - Información de referencia para identificar la entidad a eliminar.
   * @returns {Promise<object>} - La entidad eliminada.
   */
  async deleteOne(referenceInformation) {
    return await this._executeDbOperation("delete", { where: referenceInformation });
  }

  /**
   * Obtiene datos filtrados de la tabla especificada.
   * @param {object} filterConditions - Condiciones para filtrar los datos.
   * @param {object} fieldsToRetrieve - Campos a recuperar.
   * @returns {Promise<Array<object>>} - Lista de entidades filtradas.
   */
  async getFilterData(filterConditions, fieldsToRetrieve) {
    return await this._executeDbOperation("findMany", {
      where: filterConditions,
      select: fieldsToRetrieve,
    });
  }

  /**
   * Ejecuta una operación de base de datos con validaciones.
   * @param {string} operation - Operación a ejecutar (create, findMany, delete, etc.).
   * @param {object} params - Parámetros para la operación.
   * @returns {Promise<any>} - Resultado de la operación de la base de datos.
   * @private
   */
  async _executeDbOperation(operation, params = {}) {
    return await executeValidations(async () => {
      // Asegurarte que `this.database[this.tableName]` no sea undefined
      if (!prisma[this.tableName]) {
        throw new Error(`La tabla '${this.tableName}' no está definida en la instancia de Prisma.`);
      }
      try {
          const result = await prisma[this.tableName][operation](params);
          return result;
      } catch (error) { 
        throw error;
      }
    }, this.tableName, params);
  }
}
