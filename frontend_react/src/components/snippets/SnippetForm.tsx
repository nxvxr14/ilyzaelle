import { FieldErrors, UseFormRegister } from "react-hook-form"
import { SnippetFormData } from "@/types/index";
import ErrorMessage from "../ErrorMessage";

type SnippetFormProps = {
    errors: FieldErrors<SnippetFormData>
    register: UseFormRegister<SnippetFormData>
}

export default function SnippetForm({ errors, register }: SnippetFormProps) {
    return (
        <>
            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="snippetName"
                >nombre</label>
                <input
                    id="snippetName"
                    placeholder="ej. arduino laboratorio"
                    className="w-full p-3  border-gray-300 border rounded-2xl"
                    {...register("snippetName", {
                        required: "el nombre del controlador es obligatorio"
                    })}
                />
                {errors.snippetName && (
                    <ErrorMessage>{errors.snippetName.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="description"
                >tipo</label>
                <textarea
                    id="description"
                    placeholder="ej. arduino"
                    className="w-full p-3  border-gray-300 border rounded-2xl"
                    {...register("description", {
                        required: "el tipo de controlador es obligatorio",
                    })}
                />
                {errors.description && (
                    <ErrorMessage>{errors.description.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="version"
                >Número</label>
                <input
                    id="version"
                    type="number"
                    placeholder="ej. 12345"
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    {...register("version", {
                        required: "El número es obligatorio",
                        valueAsNumber: true,  // Asegura que el valor sea tratado como número
                        min: {
                            value: 1,
                            message: "El número debe ser mayor o igual a 1"
                        },
                        max: {
                            value: 99999,
                            message: "El número debe ser menor o igual a 99999"
                        }
                    })}
                />
                {errors.version && (
                    <ErrorMessage>{errors.version.message}</ErrorMessage>
                )}
            </div>

        </>
    )
}
