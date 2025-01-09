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
                    className="w-full p-3  border-gray-300 border rounded-2xl"
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
                {/* <input
                    id="boardType"
                    type="text"
                    placeholder="ej. arduino"
                    className="w-full p-3  border-gray-300 border rounded-2xl"
                    {...register("boardType", {
                        required: "el tipo de controlador es obligatorio",
                    })}
                /> */}
                <select
                    id="boardType"
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    {...register("boardType", {
                        required: "La conexión es obligatoria",
                    })}
                >
                    <option value="1">arduino uno</option>
                    <option value="2">plc328p</option>
                    <option value="3">esp32</option>
                </select>
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
                    className="w-full p-3 border-gray-300 border rounded-2xl"
                    {...register("boardConnect", {
                        required: "La conexión es obligatoria",
                    })}
                >
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
                            className="w-full p-3 border-gray-300 border rounded-2xl"
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
                            className="w-full p-3 border-gray-300 border rounded-2xl"
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
                            className="w-full p-3 border-gray-300 border rounded-2xl"
                            {...register("boardInfo.type", {
                            })}
                        />
                        {/* {errors.boardInfo?.type && (
                            <ErrorMessage>{errors.boardInfo.type.message}</ErrorMessage>
                        )} */}
                    </div>
                </div>
            </div>
        </>
    )
}
