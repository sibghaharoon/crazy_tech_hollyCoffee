import type { Request, Response } from "express";
import type { Types } from "mongoose";
import CartService from "../services/cart.service";
import cartValidator from "../validators/cart.validator";

const getUserId = (req: Request, res: Response): Types.ObjectId | null => {
  if (req.user) return req.user._id;

  res.status(401).json({
    success: false,
    message: "Authentication required",
    code: "AUTH_REQUIRED",
  });
  return null;
};

const cartController = {
  async get(req: Request, res: Response) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const cart = await CartService.get(userId);
    return res.status(200).json({ success: true, data: cart });
  },

  async addItem(req: Request, res: Response) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const parsed = cartValidator.parseAddItem(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const mutationId = req.header("Idempotency-Key")?.trim();
    if (!mutationId || mutationId.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Idempotency-Key header is required",
        code: "IDEMPOTENCY_KEY_REQUIRED",
      });
    }

    const cart = await CartService.addItem(userId, parsed.data, mutationId);
    return res.status(200).json({ success: true, data: cart });
  },

  async updateItem(req: Request, res: Response) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const params = cartValidator.parseItemParams(req.params);
    if (!params.success) return res.status(400).json(params);

    const parsed = cartValidator.parseUpdateItem(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const cart = await CartService.updateItem(
      userId,
      params.data.itemId,
      parsed.data,
    );
    return res.status(200).json({ success: true, data: cart });
  },

  async removeItem(req: Request, res: Response) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const params = cartValidator.parseItemParams(req.params);
    if (!params.success) return res.status(400).json(params);

    const cart = await CartService.removeItem(userId, params.data.itemId);
    return res.status(200).json({ success: true, data: cart });
  },

  async clear(req: Request, res: Response) {
    const userId = getUserId(req, res);
    if (!userId) return;

    const cart = await CartService.clear(userId);
    return res.status(200).json({ success: true, data: cart });
  },
};

export default cartController;
