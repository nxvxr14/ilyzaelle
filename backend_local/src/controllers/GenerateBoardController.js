import { connectBoard } from "../config/generate.js";

export const generateBoardController = async (data) => {
  try {
    console.log("[GenerateBoardController] Starting connectBoard with data:", data._id);
    await connectBoard({ data }); 
    console.log("[GenerateBoardController] connectBoard completed successfully");
  } catch (error) {
    console.error("[GenerateBoardController] Error in connectBoard:", error);
    // Re-throw with a proper error message
    throw new Error(error?.message || error?.toString() || "Failed to connect board");
  }
};
