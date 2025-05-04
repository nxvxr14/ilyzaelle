import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { ProjectFormData } from "@/types/index.ts";

type ProjectFormProps = {
    register: UseFormRegister<ProjectFormData>,
    errors: FieldErrors<ProjectFormData>
}

export default function ProjectForm({ register, errors }: ProjectFormProps) {
    return (
        <>
            <div className="mb-6">
                <label 
                    htmlFor="projectName" 
                    className="block text-gray-700 font-bold mb-2 text-lg"
                >
                    Nombre del proyecto
                </label>
                <input
                    id="projectName"
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    type="text"
                    placeholder="Ingrese el nombre del proyecto"
                    {...register("projectName", {
                        required: "El nombre del proyecto es obligatorio",
                    })}
                />
                {errors.projectName && (
                    <ErrorMessage>{errors.projectName.message}</ErrorMessage>
                )}
            </div>

            <div className="mb-6">
                <label 
                    htmlFor="server" 
                    className="block text-gray-700 font-bold mb-2 text-lg"
                >
                    Gateway
                </label>
                <input
                    id="server"
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    type="text"
                    placeholder="Dirección del gateway"
                    {...register("server", {
                        required: "La dirección del gateway es obligatoria"
                    })}
                />
                {errors.server && (
                    <ErrorMessage>{errors.server.message}</ErrorMessage>
                )}
            </div>

            <div className="mb-6">
                <label 
                    htmlFor="serverAPIKey" 
                    className="block text-gray-700 font-bold mb-2 text-lg"
                >
                    Gateway API key
                </label>
                <input
                    id="serverAPIKey"
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                    type="text"
                    placeholder="Clave de API para el gateway"
                    {...register("serverAPIKey", {
                        required: "La clave API es obligatoria"
                    })}
                />
                {errors.serverAPIKey && (
                    <ErrorMessage>{errors.serverAPIKey.message}</ErrorMessage>
                )}
            </div>

            <div className="mb-6">
                <label 
                    htmlFor="description" 
                    className="block text-gray-700 font-bold mb-2 text-lg"
                >
                    Descripción
                </label>
                <textarea
                    id="description"
                    className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 min-h-[120px]"
                    placeholder="Describe brevemente el propósito del proyecto"
                    {...register("description", {
                        required: "La descripción es obligatoria"
                    })}
                />
                {errors.description && (
                    <ErrorMessage>{errors.description.message}</ErrorMessage>
                )}
            </div>
        </>
    );
}
