import { Navigate, useLocation, useParams } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import EditBoardModal from './EditBoardModal';
import { getBoardById } from "@/api/BoardApi";

function EditBoardData() {

    // el projectId viene como ruta dinamica "/:projectId", para obtenerla se usa params, por el otro lado boardId viene como parametro de consulta, "?boardId" en este caso se usa location
    const params = useParams()
    const projectId = params.projectId!
    // para traerme el valor del param que envio en la url
    // con esto ya puedo hacer una consulta a la base de datos
    // despues voy a la api del frontend a realizar la funcion de la consulta
    const location = useLocation()
    // console.log(location.search);
    const queryParams = new URLSearchParams(location.search)
    // con el ! se vuelve un string el tipo de dato
    const boardId = queryParams.get('editBoard')!
    // console.log(editBoard);
    // console.log(queryParams);

    const { data, isError } = useQuery({
        queryKey: ['editBoard', boardId],
        // cuando la funcion toma parametros ponemos un callback
        // no puede tomar multiples parametros, si son varios se envian como objeto por medio de llaves
        queryFn: () => getBoardById({ projectId, boardId }),
        // en base a una condicion se ejecuta o no la consulta, solo recibe true/false
        // el !! retorna true, convierte una variable a boolean, si tiene dato retorna true, si no tiene nada false
        // para controlar cuando hacemos una consulta, cuando tenemos el dato en la url
        enabled: !!boardId
    })

    if (isError) return <Navigate to={'/404'} />

    if (data) return (
        <EditBoardModal data={data} boardId={boardId} />
    )
}

export default EditBoardData;