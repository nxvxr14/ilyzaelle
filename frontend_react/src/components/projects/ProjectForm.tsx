import { FieldErrors, UseFormRegister } from "react-hook-form";
import ErrorMessage from "../ErrorMessage";
import { ProjectFormData } from "@/types/index.ts";

// los generics (lo que va dentro de ls objetos) este type los obtuve copiando&pegando los ofrecidos por react en el useForm
type ProjectFormProps = {
    register: UseFormRegister<ProjectFormData>,
    errors: FieldErrors<ProjectFormData>
}
// si no hubiera usado zod para crear mi type tendria que hacerlo de esta manera
/*
type ProjectFormProps = {
    register: UseFormRegister<{
        projectName: string;
        description: string;
    }>,
    errors: FieldErrors<{
        projectName: string;
        description: string;
    }>
}
*/

export default function ProjectForm({ register, errors }: ProjectFormProps) {
    return (
        <>
            <div className="mb-5 space-y-3">
                <label htmlFor="projectName" className="text-lg font-bold">
                    nombre del proyecto
                </label>
                <input
                    id="projectName"
                    className="w-full p-3  border border-gray-200"
                    type="text"
                    placeholder="nombre"
                    {...register("projectName", {
                        required: "titulo obligatorio",
                    })}
                />
                {errors.projectName && (
                    <ErrorMessage>{errors.projectName.message}</ErrorMessage>
                )}
            </div>

            <div className="mb-5 space-y-3">
                <label htmlFor="server" className="text-lg font-bold">
               server 
                </label>
                <textarea
                    id="server"
                    className="w-full p-3  border border-gray-200"
                    placeholder="server"
                    {...register("server", {
                        required: "server obligatoria"
                    })}
                />
            </div>

            <div className="mb-5 space-y-3">
                <label htmlFor="serverAPIKey" className="text-lg font-bold">
               server API 
                </label>
                <textarea
                    id="serverAPIKey"
                    className="w-full p-3  border border-gray-200"
                    placeholder="serverAPIKey"
                    {...register("serverAPIKey", {
                        required: "serverAPIKey obligatoria"
                    })}
                />
            </div>

            <div className="mb-5 space-y-3">
                <label htmlFor="description" className="text-lg font-bold">
                    descripción
                </label>
                <textarea
                    id="description"
                    className="w-full p-3  border border-gray-200"
                    placeholder="descripción"
                    {...register("description", {
                        required: "descripción obligatoria"
                    })}
                />

                {errors.description && (
                    <ErrorMessage>{errors.description.message}</ErrorMessage>
                )}
            </div>
        </>
    )
}
