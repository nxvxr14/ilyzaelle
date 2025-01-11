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
            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl">Nombre Global</label>
                <label className="font-normal text-2xl">{nameGlobalVar}</label>
                <label className="font-normal text-sm text-gray-500">Este campo no se puede editar</label>
                <input
                    type="hidden"
                    value={nameGlobalVar} // Solo muestra el valor
                    readOnly
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    {...register("nameGlobalVar")} // Esto sigue registrando el campo, pero no se puede editar
                />
            </div>


            {/* El resto del formulario */}
            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="nameData">Nombre</label>
                <input
                    id="nameData"
                    placeholder="ej. arduino laboratorio"
                    className="w-full p-3  border-gray-300 border rounded-2xl"
                    {...register("nameData", {
                        required: "El nombre del controlador es obligatorio"
                    })}
                />
                {errors.nameData && (
                    <ErrorMessage>{errors.nameData.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="description">descripcion</label>
                <textarea
                    id="description"
                    placeholder="ej. arduino"
                    className="w-full p-3  border-gray-300 border rounded-2xl"
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
