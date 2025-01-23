import express  from "express";
import fs       from "fs/promises";
import { dirname,join} from "path";
import { fileURLToPath } from "url";
const routesToUse  = express.Router();
const {ROUTE_VERSION: versionToUse} = process.env
const __dirname    = dirname(fileURLToPath(import.meta.url))

//eliminando la extension con la finalidad de usar su nombre como url para las peticiones
const removeExtension = (fileNameToFilter) => fileNameToFilter.replace(/\.[^.]+$/,'');

//agregando los archivos dinamicamente que se encuentren dentro de la carpeta especificada en el versionado
try
{
    const listOfDirectories = await fs.readdir(join(__dirname,versionToUse));
    for(const directory of listOfDirectories)
    {
        if (directory === 'index.js' || !/\.js$/.test(directory)) continue;
        const routePath = `/${removeExtension(directory)}`;
        const routerHandler          = (await import(`./${versionToUse}/${directory}`)).default;
        routesToUse.use(routePath,routerHandler);
    }

}catch(err)
{
    //TODO: mejorar el manejo de errores
    console.log(err);
}


export default routesToUse