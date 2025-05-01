import { FieldErrors, UseFormRegister } from "react-hook-form"
import { BoardFormData } from "@/types/index";
import ErrorMessage from "../ErrorMessage";

type BoardFormProps = {
    errors: FieldErrors<BoardFormData>
    register: UseFormRegister<BoardFormData>
}

export default function BoardForm({ errors, register }: BoardFormProps) {
    return (
        <>
            <div className="flex flex-col gap-3 mb-5">
                <label
                    className="font-medium text-xl text-gray-700"
                    htmlFor="boardName"
                >Nombre</label>
                <input
                    id="boardName"
                    placeholder="ej. arduino laboratorio"
                    className="w-full p-3.5 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/50 hover:bg-white"
                    {...register("boardName", {
                        required: "el nombre del controlador es obligatorio"
                    })}
                />
                {errors.boardName && (
                    <ErrorMessage>{errors.boardName.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-3 mb-5">
                <label
                    className="font-medium text-xl text-gray-700"
                    htmlFor="boardType"
                >Marca</label>
                <select
                    id="boardType"
                    className="w-full p-3.5 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/50 hover:bg-white appearance-none cursor-pointer"
                    {...register("boardType", {
                        required: "La conexión es obligatoria",
                    })}
                >
                    <option value="1">Arduino</option>
                    <option value="2">Xelorium</option>
                    <option value="3">Esp32</option>
                    <option value="4">Nodo</option>
                </select>
                {errors.boardType && (
                    <ErrorMessage>{errors.boardType.message}</ErrorMessage>
                )}
            </div>


            <div className="flex flex-col gap-3 mb-5">
                <label className="font-medium text-xl text-gray-700" htmlFor="boardConnect">
                   Tipo de conexión 
                </label>
                <select
                    id="boardConnect"
                    className="w-full p-3.5 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/50 hover:bg-white appearance-none cursor-pointer"
                    {...register("boardConnect", {
                        required: "La conexión es obligatoria",
                    })}
                >
                    <option value="1">USB</option>
                    <option value="2">Wi-Fi</option>
                    <option value="3">Ethernet</option>
                </select>
                {errors.boardConnect && (
                    <ErrorMessage>{errors.boardConnect.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-3 mb-5 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-xl text-gray-800 mb-2">Datos de conexión</h3>
                <div className="flex flex-col md:flex-row gap-5">
                    {/* Host */}
                    <div className="flex-1">
                        <label className="font-medium text-gray-700 mb-1.5 block" htmlFor="host">
                           Host 
                        </label>
                        <input
                            id="host"
                            type="text"
                            placeholder="Ingrese el host"
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/80 hover:bg-white"
                            {...register("boardInfo.host", {
                            })}
                        />
                        {errors.boardInfo?.host && (
                            <ErrorMessage>{errors.boardInfo.host.message}</ErrorMessage>
                        )}
                    </div>

                    {/* Port */}
                    <div className="flex-1">
                        <label className="font-medium text-gray-700 mb-1.5 block" htmlFor="port">
                            Puerto
                        </label>
                        <input
                            id="port"
                            type="text"
                            placeholder="Ingrese el puerto"
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/80 hover:bg-white"
                            {...register("boardInfo.port", {
                                required: "El campo 'port' es obligatorio",
                            })}
                        />
                        {errors.boardInfo?.port && (
                            <ErrorMessage>{errors.boardInfo.port.message}</ErrorMessage>
                        )}
                    </div>

                    {/* Type */}
                    <div className="flex-1">
                        <label className="font-medium text-gray-700 mb-1.5 block" htmlFor="type">
                            Tipo
                        </label>
                        <input
                            id="type"
                            type="text"
                            placeholder="Ingrese el tipo"
                            className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 bg-white/80 hover:bg-white"
                            {...register("boardInfo.type", {
                            })}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
