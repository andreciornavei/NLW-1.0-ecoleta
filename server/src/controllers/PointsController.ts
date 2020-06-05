import { Request, Response } from "express";
import knex from "./../database/connection";

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));
    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image: `http://192.168.2.100:3333/uploads/${point.image}`,
      };
    });
    return response.status(200).json(serializedPoints);
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const point = await knex("points").where("id", id).first();
    if (!point) {
      return response.status(404).json({ message: "Point not found" });
    }

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .select("items.title")
      .where("point_items.point_id", id);

    const serializedPoint = {
      ...point,
      image: `http://192.168.2.100:3333/uploads/${point.image}`,
    };
    return response.status(200).json({
      serializedPoint,
      items,
    });
  }

  async create(request: Request, response: Response) {
    const trx = await knex.transaction();
    try {
      const [point_id, ...rest] = await trx("points").insert({
        image: request.file.filename,
        name: request.body.name,
        email: request.body.email,
        whatsapp: request.body.whatsapp,
        latitude: request.body.latitude,
        longitude: request.body.longitude,
        city: request.body.city,
        uf: request.body.uf,
      });
      const pointItems = request.body.items
        .split(",")
        .map((item_id: string) => Number(item_id.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id,
          };
        });
      await trx("point_items").insert(pointItems);
      const responseData = await trx("points").where("id", point_id).first();
      await trx.commit();
      return response.json(responseData);
    } catch (err) {
      await trx.rollback();
      return response.json({ error: { message: "Error on create point" } });
    }
  }
}

export default PointsController;
