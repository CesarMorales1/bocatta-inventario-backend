import { Prisma, PrismaClient } from "@prisma/client";
//Tenia dos opciones dado que node.js es cacheado y para crear una instancia que no se sobreescriba podria exportar dicho objecto pero preferi manejar
//la instancia de prisma en la variable global si puede ser sobreescrita utilizaria un enclosure dentro de la funcion que devuelva la referencia hacia la el objeto en si
export function getPrismaInstance()
{
    return global.prismaInstance = global.prismaInstance ?? new PrismaClient();
}
