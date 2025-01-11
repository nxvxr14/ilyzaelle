import type { Request, Response } from "express";
import DataVar from "../models/DataVar";

export class DataVarController {
  static createDataVar = async (req: Request, res: Response) => {
    try {
      const dataVar = new DataVar(req.body);
      // aca uso req porque lo pase como un param hacia este enpoint, si no, usaria solo project.id
      dataVar.project = req.project.id;
      req.project.dataVars.push(dataVar.id);
      await Promise.allSettled([dataVar.save(), req.project.save()]);
      res.send("[devMessage] Board initialized correctly.");
    } catch (error) {
      console.log(error);
    }
  };

  static getProjectDataVars = async (req: Request, res: Response) => {
    try {
      // populate se pone el nombre de la referencia de dataVars, no el nombre del modelo de Project
      const dataVar = await DataVar.find({ project: req.project.id }).populate(
        "project"
      );
      if (!dataVar) {
        const error = new Error("DataVar not found.");
        return res.status(404).json({ error: error.message });
      }
      res.json(dataVar);
    } catch (error) {
      console.log(error);
    }
  };

  static getDataVarsById = async (req: Request, res: Response) => {
    try {
      console.log(req.dataVar.project);
      console.log(req.project.id);
      res.json(req.dataVar);
    } catch (error) {
      res.status(500).json({ error: "There was an error." });
    }
  };

  static deleteDataVar = async (req: Request, res: Response) => {
    try {
      //    console.log(board.project);
      //    console.log(req.project.id);

      // aca solo elimino la board de la collecion de board pero tambien necesito eliminar la referencia de las boards asociadas a proyectos
      // para eliminar la referencia tambien
      req.project.dataVars = req.project.dataVars.filter(
        (dataVar) => dataVar.toString() !== req.dataVar.id.toString()
      );
      Promise.allSettled([req.dataVar.deleteOne(), req.project.save()]);
      res.send("Board deleted.");
    } catch (error) {
      res.status(500).json({ error: "There was an error." });
    }
  };
}
