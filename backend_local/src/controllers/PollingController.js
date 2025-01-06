// import { getBoards } from "../../api/databaseApi.js";

import { boards } from "../config/generate.js";
import { SerialPort, firmata } from "../config/index.js";
import { generateBoardController } from "./GenerateBoardController.js";
import { updateCodeBoardController } from "./UpdateCodeBoardController.js";

export class PollingController {
  static getStatusLocal = async (req, res) => {
    try {
      res.status(200).json({
        message: "localhost is online",
        online: true,
      });

    } catch (error) {
      res.status(500).json({ error: "There was an error." });
    }
  };

  static getBoardStatus = async (req, res) => {
    const _id = req.params.boardId;
    try {
      res.status(200).json({ active: boards[_id].isReady });
    } catch (error) {
      res.status(200).json({ active: false });
    }
  }

  static pollingBoards = async (req, res) => {
    try {
      // para hacer aca la consulta a la base de datos
      // const data = await getBoards();
      console.log(req.body);
      const generate = await generateBoardController(req.body);
      res.status(200).json({ message: "Boards data polled successfully." });
      return req.body;
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while polling boards data." });
    }
  };


  static pollingCodes = async (req, res) => {
    try {
      // para hacer aca la consulta a la base de datos
      // const data = await getBoards();
      // console.log(req.body);
      const update = await updateCodeBoardController(req.body);
      res.status(200).json({ message: "Boards data polled successfully." });
      return req.body;
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while polling boards data." });
    }
  };

}
