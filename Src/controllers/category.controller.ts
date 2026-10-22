import type { Request, Response } from "express";
import CategoryService from "../services/Category.Service";
import categoryValidator from "../validators/Category.Validator";

const getCategoryFiles = (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  return {
    image: files?.image?.[0],
    banner: files?.banner?.[0],
  };
};

const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await CategoryService.listActive();
    return res.status(200).json({ success: true, data: categories });
  },

  async listAll(req: Request, res: Response) {
    const categories = await CategoryService.listAll(req.user?.role);
    return res.status(200).json({ success: true, data: categories });
  },

  async create(req: Request, res: Response) {
    const parsed = categoryValidator.parseCreate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const files = getCategoryFiles(req);
    const category = await CategoryService.create(req.user?.role, parsed.data, files.image, files.banner);
    return res.status(201).json({ success: true, data: category });
  },

  async update(req: Request, res: Response) {
    const parsed = categoryValidator.parseUpdate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const files = getCategoryFiles(req);
    const category = await CategoryService.update(
      req.user?.role,
      req.params.categoryId,
      parsed.data,
      files.image,
      files.banner,
    );
    return res.status(200).json({ success: true, data: category });
  },
};

export default categoryController;
