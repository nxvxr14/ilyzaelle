import { connectBoard } from "../config/generate.js";

export const generateBoardController = async (data) => {
  await connectBoard({ data }); 
  // data.boardConnect === 1 && (await boardSerial({ data }));
  // data.boardConnect === 2 && (await boardWifi({ data }));
};
