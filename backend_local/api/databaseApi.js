import axios from "axios";

const url = `${process.env.SOCKETSERVER_URL}/api/projects/6772dd4f41c61141bf8a69b2/`;

export async function getBoards() {
  try {
    const { data } = await axios.get(url, {
      headers: {
        Origin: [process.env.FRONTEND_URL],
      },
    });
    return data.boards;
  } catch (error) {
    console.error("Error al hacer la solicitud:", error);
  }
}