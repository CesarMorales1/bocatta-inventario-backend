import { CommonCrudMixin } from "./genericUseCase.js";
import { AppError } from "../../domain/exeptions/AppError.js";

export class AjusteUseCase extends CommonCrudMixin {
    constructor({ database }) {
        super({ database, tableName: "kardex_materia_prima" });
    }

    async realizarAjuste({ tipo, fecha_movimiento, observaciones, materias_primas }) {
        try {
            this.validarEntrada(materias_primas);

            const fechaAjuste = new Date(fecha_movimiento);
            fechaAjuste.setHours(23, 59, 59, 999);

            return await this.database.$transaction(async (prisma) => {
                const resultados = await Promise.all(materias_primas.map(async (mp) => {
                    return this.procesarMateriaPrima(prisma, mp, fechaAjuste, observaciones);
                }));

                return resultados;
            });
        } catch (error) {
            console.error('[Error en realizarAjuste]:', error);
            throw new AppError(
                'InternalError',
                500,
                `Error al procesar el ajuste: ${error.message}`,
                true
            );
        }
    }

    validarEntrada(materias_primas) {
        if (!Array.isArray(materias_primas) || materias_primas.length === 0) {
            throw new AppError('InvalidInput', 400, 'Se esperaba un array de materias primas no vacío', true);
        }
    }

    async procesarMateriaPrima(prisma, mp, fechaAjuste, observaciones) {
        const { id_materia_prima, cantidad } = mp;

        if (isNaN(cantidad)) {
            return {
                id_materia_prima,
                success: false,
                message: 'La cantidad debe ser un número'
            };
        }

        const materiaPrima = await prisma.materia_prima.findUnique({
            where: { id_materia_prima: id_materia_prima }
        });

        if (!materiaPrima) {
            return {
                id_materia_prima,
                success: false,
                message: 'Materia prima no encontrada'
            };
        }

        if (await this.existeAjusteEnFecha(prisma, id_materia_prima, fechaAjuste)) {
            return {
                id_materia_prima,
                success: false,
                message: 'Ya existe un ajuste para esta materia prima en la fecha seleccionada'
            };
        }

        const nuevoSaldo = Number(cantidad);
        const delta = nuevoSaldo - materiaPrima.stock_actual;

        const nuevoMovimiento = await this.registrarAjuste(prisma, id_materia_prima, delta, nuevoSaldo, materiaPrima.costo_unitario, observaciones, fechaAjuste);

        await this.recalcularSaldos(prisma, id_materia_prima, fechaAjuste, nuevoSaldo);

        const ultimoMovimiento = await this.obtenerUltimoMovimiento(prisma, id_materia_prima);

        await this.actualizarStock(prisma, id_materia_prima, ultimoMovimiento.saldo);

        return {
            id_materia_prima,
            success: true,
            message: 'Ajuste realizado correctamente',
            delta: delta,
            nuevoSaldo: ultimoMovimiento.saldo
        };
    }

    async existeAjusteEnFecha(prisma, id_materia_prima, fechaAjuste) {
        const fechaInicioDia = new Date(fechaAjuste);
        const fechaFinDia = new Date(fechaAjuste);
        fechaFinDia.setHours(23, 59, 59, 999);

        return await prisma.kardex_materia_prima.findFirst({
            where: {
                id_materia_prima: id_materia_prima,
                tipo_movimiento: "AJUSTE",
                fecha_movimiento: {
                    gte: fechaInicioDia,
                    lte: fechaFinDia
                }
            }
        });
    }

    async registrarAjuste(prisma, id_materia_prima, delta, nuevoSaldo, costo_unitario, observaciones, fechaAjuste) {
        return await prisma.kardex_materia_prima.create({
            data: {
                id_materia_prima: id_materia_prima,
                tipo_movimiento: "AJUSTE",
                cantidad: delta,
                saldo: nuevoSaldo,
                costo_unitario: costo_unitario,
                costo_total: delta * Number(costo_unitario),
                referencia: `Ajuste manual - ${observaciones}`,
                observaciones: observaciones,
                fecha_movimiento: fechaAjuste
            }
        });
    }

    async recalcularSaldos(prisma, id_materia_prima, fechaAjuste, nuevoSaldo) {
        const nextAdjustment = await prisma.kardex_materia_prima.findFirst({
            where: {
                id_materia_prima: id_materia_prima,
                tipo_movimiento: "AJUSTE",
                fecha_movimiento: { gt: fechaAjuste }
            },
            orderBy: { fecha_movimiento: 'asc' },
            select: { fecha_movimiento: true, saldo: true, id_kardex: true }
        });

        const movimientosPosteriores = await prisma.kardex_materia_prima.findMany({
            where: {
                id_materia_prima: id_materia_prima,
                fecha_movimiento: {
                    gte: fechaAjuste,
                    lt: nextAdjustment?.fecha_movimiento
                },
                NOT: [
                    { tipo_movimiento: "AJUSTE" }
                ]
            },
            orderBy: [
                { fecha_movimiento: 'asc' },
                { id_kardex: 'asc' }
            ]
        });

        let saldoAcumulado = Number(nuevoSaldo);
        for (const movimiento of movimientosPosteriores) {
            saldoAcumulado += movimiento.tipo_movimiento === "ENTRADA" 
                ? Number(movimiento.cantidad) 
                : -Number(movimiento.cantidad);

            await prisma.kardex_materia_prima.update({
                where: { id_kardex: movimiento.id_kardex },
                data: { saldo: saldoAcumulado }
            });
        }
    }

    async obtenerUltimoMovimiento(prisma, id_materia_prima) {
        return await prisma.kardex_materia_prima.findFirst({
            where: { id_materia_prima: id_materia_prima },
            orderBy: [
                { fecha_movimiento: 'desc' },
                { id_kardex: 'desc' }
            ],
            select: { saldo: true }
        });
    }

    async actualizarStock(prisma, id_materia_prima, saldo) {
        await prisma.materia_prima.update({
            where: { id_materia_prima: id_materia_prima },
            data: { stock_actual: saldo }
        });
    }
}