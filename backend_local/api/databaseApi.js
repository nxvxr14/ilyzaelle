import axios from "axios";

const url = "http://192.168.1.12:3030/api/projects/6772dd4f41c61141bf8a69b2/";

export async function getBoards() {
  try {
    const { data } = await axios.get(url, {
      headers: {
        Origin: "http://localhost:5173",
      },
    });
    return data.boards;
  } catch (error) {
    console.error("Error al hacer la solicitud:", error);
  }
}
