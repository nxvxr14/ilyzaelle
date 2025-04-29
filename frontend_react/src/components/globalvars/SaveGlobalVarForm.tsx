import { FieldErrors, UseFormRegister } from "react-hook-form"
import { SaveGlobalVarFormData } from "@/types/index";
import ErrorMessage from "../ErrorMessage";

type SaveGlobalModalProps = {
    nameGlobalVar: string
    errors: FieldErrors<SaveGlobalVarFormData>
    register: UseFormRegister<SaveGlobalVarFormData>
}

export default function SaveGlobalVarForm({ nameGlobalVar, errors, register }: SaveGlobalModalProps) {
    return (
        <>
            {/* Mostrar nameGlobalVar */}
            <div className="flex flex-col gap-3 mb-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="font-medium text-xl text-gray-700">Nombre Global</label>
                <div className="font-medium text-lg bg-white/80 p-3.5 border border-gray-300 rounded-xl text-gray-600">
                    {nameGlobalVar}
                </div>
                <p className="font-normal text-sm text-gray-500 italic">Este campo no se puede editar</p>
                <input
                    type="hidden"
                    value={nameGlobalVar} // Solo muestra el valor
                    readOnly
                />
            </div>


            {/* El resto del formulario */}
            <div className="flex flex-col gap-3 mb-5">
                <label className="font-medium text-xl text-gray-700" htmlFor="nameData">
                    Nombre
                </label>
                <input
                    id="nameData"
                    placeholder="ej. temperatura_sensor_1"
                    className="w-full p-3.5 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/50 hover:bg-white"
                    {...register("nameData", {
                        required: "El nombre del controlador es obligatorio"
                    })}
                />
                {errors.nameData && (
                    <ErrorMessage>{errors.nameData.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-3 mb-5">
                <label className="font-medium text-xl text-gray-700" htmlFor="description">
                    Descripción
                </label>
                <textarea
                    id="description"
                    placeholder="Ingrese una descripción para esta variable"
                    rows={4}
                    className="w-full p-3.5 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/50 hover:bg-white resize-none"
                    {...register("description", {
                        required: "El tipo de controlador es obligatorio",
                    })}
                />
                {errors.description && (
                    <ErrorMessage>{errors.description.message}</ErrorMessage>
                )}
            </div>
        </>
    );
}
