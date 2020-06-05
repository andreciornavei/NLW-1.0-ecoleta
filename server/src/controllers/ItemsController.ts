import { Request, Response } from "express";
import knex from "./../database/connection";

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex("items").select("*");
    const serializedItems = items.map((item) => {
      return {
        ...item,
        image: `http://192.168.2.100:3333/uploads/${item.image}`,
      };
    });
    return response.status(200).json(serializedItems);
  }
}

export default ItemsController;