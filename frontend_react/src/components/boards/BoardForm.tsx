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
            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="boardName"
                >nombre</label>
                <input
                    id="boardName"
                    placeholder="ej. arduino laboratorio"
                    className="w-full p-3  border-gray-300 border"
                    {...register("boardName", {
                        required: "el nombre del controlador es obligatorio"
                    })}
                />
                {errors.boardName && (
                    <ErrorMessage>{errors.boardName.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <label
                    className="font-normal text-2xl"
                    htmlFor="boardType"
                >tipo</label>
                <input
                    id="boardType"
                    type="text"
                    placeholder="ej. arduino"
                    className="w-full p-3  border-gray-300 border"
                    {...register("boardType", {
                        required: "el tipo de controlador es obligatorio",
                    })}
                />
                {errors.boardType && (
                    <ErrorMessage>{errors.boardType.message}</ErrorMessage>
                )}
            </div>


            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="boardConnect">
                    conexión
                </label>
                <select
                    id="boardConnect"
                    className="w-full p-3 border-gray-300 border"
                    {...register("boardConnect", {
                        required: "La conexión es obligatoria",
                    })}
                >
                    <option value="">-- abrir --</option> {/* Opción para no seleccionar nada */}
                    <option value="1">usb</option>
                    <option value="2">wifi</option>
                    <option value="3">ethernet</option>
                </select>
                {errors.boardConnect && (
                    <ErrorMessage>{errors.boardConnect.message}</ErrorMessage>
                )}
            </div>

            <div className="flex flex-col gap-5">
                <h3 className="font-normal text-2xl">información</h3>
                <div className="flex gap-5">
                    {/* Host */}
                    <div className="flex-1">
                        <label className="font-normal text-lg" htmlFor="host">
                            host
                        </label>
                        <input
                            id="host"
                            type="text"
                            placeholder=""
                            className="w-full p-3 border-gray-300 border"
                            {...register("boardInfo.host", {
                            })}
                        />
                        {errors.boardInfo?.host && (
                            <ErrorMessage>{errors.boardInfo.host.message}</ErrorMessage>
                        )}
                    </div>

                    {/* Port */}
                    <div className="flex-1">
                        <label className="font-normal text-lg" htmlFor="port">
                            port
                        </label>
                        <input
                            id="port"
                            type="text"
                            placeholder="Ingrese el puerto"
                            className="w-full p-3 border-gray-300 border"
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
                        <label className="font-normal text-lg" htmlFor="type">
                            Type
                        </label>
                        <input
                            id="type"
                            type="text"
                            placeholder="Ingrese el tipo"
                            className="w-full p-3 border-gray-300 border"
                            {...register("boardInfo.type", {
                            })}
                        />
                        {errors.boardInfo?.type && (
                            <ErrorMessage>{errors.boardInfo.type.message}</ErrorMessage>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-5">
                <label className="font-normal text-2xl" htmlFor="modeLocal">
                    ¿snippet local?
                </label>
                <select
                    id="modeLocal"
                    className="w-full p-3 border-gray-300 border"
                    {...register("modeLocal", {
                        // required: "Este campo es obligatorio",
                    })}
                >
                    <option value="">-- abrir --</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                </select>
                {errors.modeLocal && (
                    <ErrorMessage>{errors.modeLocal.message}</ErrorMessage>
                )}
            </div>


        </>
    )
}
