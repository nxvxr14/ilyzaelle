import { boardSerial, boardWifi } from "../config/generate.js";

export const generateBoardController = async ({
  _id,
  boardType,
  boardName,
  boardConnect,
  boardInfo,
  active,
  project,
  boardCode,
  closing,
}) => {
  boardConnect === 1 &&
    (await boardSerial(
      _id,
      boardType,
      boardName,
      boardInfo.port,
      active,
      closing,
      project,
      boardCode
    ));
  boardConnect === 2 &&
    (await boardWifi(
      _id,
      boardType,
      boardName,
      boardInfo,
      active,
      closing,
      project,
      boardCode
    ));
};