import type { Request, Response } from "express";
import ProductRepository from "../repositories/product.repository";
import productValidator from "../validators/product.validator";

const productController = {
  async list(req: Request, res: Response) {
    const parsed = productValidator.parseListQuery(req.query);
    if (!parsed.success) return res.status(400).json(parsed);

    const result = await ProductRepository.listActive(
      parsed.data.categoryId,
      parsed.data,
    );
    return res.status(200).json({
      success: true,
      data: {
        products: result.items,
        currentPage: parsed.data.page,
        limit: parsed.data.limit,
        totalPages: Math.ceil(result.totalCount / parsed.data.limit),
        totalCount: result.totalCount,
      },
    });
  },

  async getById(req: Request, res: Response) {
    const product = await ProductRepository.getActiveById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }
    return res.status(200).json({ success: true, data: product });
  },

  async listAll(req: Request, res: Response) {
    const parsed = productValidator.parseListQuery(req.query);
    if (!parsed.success) return res.status(400).json(parsed);

    const result = await ProductRepository.listAll(req.user?.role, parsed.data);
    return res.status(200).json({
      success: true,
      data: {
        products: result.items,
        currentPage: parsed.data.page,
        limit: parsed.data.limit,
        totalPages: Math.ceil(result.totalCount / parsed.data.limit),
        totalCount: result.totalCount,
      },
    });
  },

  async create(req: Request, res: Response) {
    const parsed = productValidator.parseCreate(req.body);
    if (!parsed.success) return res.status(400).json(parsed);
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Product image is required",
        code: "PRODUCT_IMAGE_REQUIRED",
      });
    }

    const product = await ProductRepository.create(
      req.user?.role,
      parsed.data,
      req.file,
    );
    return res.status(201).json({ success: true, data: product });
  },

  async update(req: Request, res: Response) {
    const parsed = productValidator.parseUpdate(req.body, Boolean(req.file));
    if (!parsed.success) return res.status(400).json(parsed);

    const product = await ProductRepository.update(
      req.user?.role,
      req.params.productId,
      parsed.data,
      req.file,
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }
    return res.status(200).json({ success: true, data: product });
  },
};

export default productController;
