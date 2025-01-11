import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form"
import ErrorMessage from "../ErrorMessage";
import { AddGlobalVarFormData } from "@/types/index";

type GlobalVarFormProps = {
    errors: FieldErrors<AddGlobalVarFormData>
    register: UseFormRegister<AddGlobalVarFormData>
    setValue: UseFormSetValue<AddGlobalVarFormData>
}

export default function AddGlobalVarForm({ errors, register, setValue }: GlobalVarFormProps) {
    // Función para actualizar el valor inicial cuando se selecciona el tipo
    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = e.target.value;
        
        // Resetear el valor inicial dependiendo del tipo seleccionado
        if (selectedType === "boolean") {
            setValue("initialValue", true); // Default value for boolean
        } else if (selectedType === "array") {
            setValue("initialValue", []); // Default value for array
        } else {
            setValue("initialValue", 0); // Default value for number
        }
    };

    return (
        <>
            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="nameGlobalVar">Nombre</label>
                <input
                    id="nameGlobalVar"
                    placeholder="Ej. Arduino laboratorio"
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    {...register("nameGlobalVar", {
                        required: "El nombre del controlador es obligatorio"
                    })}
                />
                {errors.nameGlobalVar && (
                    <ErrorMessage>{errors.nameGlobalVar.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="typeGlobalVar">Tipo</label>
                <select
                    id="typeGlobalVar"
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    onChange={handleTypeChange}
                >
                    <option value="number">Número</option>
                    <option value="array">Array</option>
                    <option value="boolean">Booleano</option>
                </select>
            </div>
        </>
    );
}
