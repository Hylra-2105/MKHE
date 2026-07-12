import Cart from "./cart.model.js";
import Product from "../products/product.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    
    // Filter out items where product might have been deleted
    const validItems = cart.items.filter(item => item.product != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    
    return successResponse(res, 200, "CART_FETCHED", cart);
  } catch (error) {
    console.error("[getCart] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// POST /api/cart/sync
// Merges local cart with server cart (adds quantities up to stock limit)
export const syncCart = async (req, res) => {
  try {
    const { items: localItems } = req.body;
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    if (!localItems || localItems.length === 0) {
      const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
      return successResponse(res, 200, "CART_SYNCED", populatedCart);
    }

    // Process merge
    for (const localItem of localItems) {
      const productId = localItem.product?._id || localItem.product;
      if (!productId) continue;
      
      const quantity = localItem.quantity || 1;

      const color = localItem.color;

      // Find if product exists to check stock
      const productDoc = await Product.findById(productId);
      if (!productDoc) continue;

      let maxStock = productDoc.stock;
      let colorImage = null;

      // If product has colors, validate the color
      if (productDoc.colors && productDoc.colors.length > 0) {
        if (!color) continue; // Skip if no color provided but product has colors
        const colorVariant = productDoc.colors.find((c) => c.name === color);
        if (!colorVariant) continue; // Invalid color
        maxStock = colorVariant.stock;
        colorImage = colorVariant.image;
      }

      const iAddOnsStr = (localItem.addOns || []).map(a => a.name).sort().join('|');

      const existingItemIndex = cart.items.findIndex(
        (i) => {
          const sameProduct = i.product.toString() === productId.toString();
          const sameColor = i.color === color;
          const cartAddOnsStr = (i.addOns || []).map(a => a.name).sort().join('|');
          return sameProduct && sameColor && iAddOnsStr === cartAddOnsStr;
        }
      );
      
      if (existingItemIndex > -1) {
        // Merge quantities, cap at stock
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        cart.items[existingItemIndex].quantity = Math.min(newQuantity, maxStock);
      } else {
        // Add new item, cap at stock
        cart.items.push({
          product: productId,
          quantity: Math.min(quantity, maxStock),
          color: color || undefined,
          colorImage: colorImage || undefined,
          addOns: localItem.addOns || [],
        });
      }
    }

    await cart.save();
    
    const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    return successResponse(res, 200, "CART_SYNCED", populatedCart);
  } catch (error) {
    console.error("[syncCart] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// PUT /api/cart/items
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity, color } = req.body;
    
    if (!productId || quantity == null) {
      return errorResponse(res, 400, "MISSING_FIELDS");
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const productDoc = await Product.findById(productId);
    if (!productDoc) {
      return errorResponse(res, 404, "PRODUCT_NOT_FOUND");
    }

    let maxStock = productDoc.stock;
    let colorImage = null;

    if (productDoc.colors && productDoc.colors.length > 0) {
      if (!color) {
        return errorResponse(res, 400, "COLOR_REQUIRED");
      }
      const colorVariant = productDoc.colors.find((c) => c.name === color);
      if (!colorVariant) {
        return errorResponse(res, 400, "INVALID_COLOR");
      }
      maxStock = colorVariant.stock;
      colorImage = colorVariant.image;
    }

    const validQuantity = Math.max(1, Math.min(quantity, maxStock));

    const iAddOnsStr = (req.body.addOns || []).map(a => a.name).sort().join('|');

    const existingItemIndex = cart.items.findIndex(
      (i) => {
        const sameProduct = i.product.toString() === productId.toString();
        const sameColor = i.color === color;
        const cartAddOnsStr = (i.addOns || []).map(a => a.name).sort().join('|');
        return sameProduct && sameColor && iAddOnsStr === cartAddOnsStr;
      }
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = validQuantity;
    } else {
      cart.items.push({
        product: productId,
        quantity: validQuantity,
        color: color || undefined,
        colorImage: colorImage || undefined,
        addOns: req.body.addOns || [],
      });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    return successResponse(res, 200, "CART_ITEM_UPDATED", populatedCart);
  } catch (error) {
    console.error("[updateCartItem] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// DELETE /api/cart/items/:productId/:color?
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const color = req.query.color || req.body.color; // Accept color from query or body
    const addOns = req.body.addOns;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "CART_NOT_FOUND");
    }

    cart.items = cart.items.filter((i) => {
      if (i.product.toString() !== productId.toString()) return true;
      if (color && i.color !== color) return true;
      if (addOns) {
        const cartAddOnsStr = (i.addOns || []).map(a => a.name).sort().join('|');
        const reqAddOnsStr = addOns.map(a => a.name).sort().join('|');
        if (cartAddOnsStr !== reqAddOnsStr) return true;
      }
      return false; // Remove if everything matches
    });
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    return successResponse(res, 200, "CART_ITEM_REMOVED", populatedCart);
  } catch (error) {
    console.error("[removeCartItem] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
