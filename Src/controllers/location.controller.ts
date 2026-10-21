import type { Request, Response } from "express";
import LocationRepository from "../repositories/location.repository";
import parseLocationUpdate from "../validators/location.validator";

const locationController = {
  async getCurrent(req: Request, res: Response) {
    const actorUserId = req.user?._id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const location = await LocationRepository.findByUserId(actorUserId);

    return res.status(200).json({
      success: true,
      data: location,
    });
  },

  async update(req: Request, res: Response) {
    const parsed = parseLocationUpdate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const actorUserId = req.user?._id;
    if (!actorUserId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    const location = await LocationRepository.upsertByUserId(
      actorUserId,
      parsed.data,
    );

    return res.status(200).json({
      success: true,
      data: location,
    });
  },
};

export default locationController;
