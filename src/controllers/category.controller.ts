import type { Request, Response } from "express";
import CategoryRepository from "../repositories/category.repository";
import categoryValidator from "../validators/category.validator";

const getCategoryFiles = (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  return {
    image: files?.image?.[0],
    banner: files?.banner?.[0],
  };
};

const categoryController = {
  async list(_req: Request, res: Response) {
    const categories = await CategoryRepository.listActive();
    return res.status(200).json({ success: true, data: categories });
  },

  async listAll(req: Request, res: Response) {
    const categories = await CategoryRepository.listAll(req.user?.role);
    return res.status(200).json({ success: true, data: categories });
  },

  async create(req: Request, res: Response) {
    const parsed = categoryValidator.parseCreate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const files = getCategoryFiles(req);
    const category = await CategoryRepository.create(req.user?.role, parsed.data, files.image, files.banner);
    return res.status(201).json({ success: true, data: category });
  },

  async update(req: Request, res: Response) {
    const parsed = categoryValidator.parseUpdate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);

    const files = getCategoryFiles(req);
    const category = await CategoryRepository.update(
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
