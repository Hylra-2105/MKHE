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

      // Find if product exists to check stock
      const productDoc = await Product.findById(productId);
      if (!productDoc) continue;

      const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId.toString());
      
      if (existingItemIndex > -1) {
        // Merge quantities, cap at stock
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        cart.items[existingItemIndex].quantity = Math.min(newQuantity, productDoc.stock);
      } else {
        // Add new item, cap at stock
        cart.items.push({
          product: productId,
          quantity: Math.min(quantity, productDoc.stock),
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
    const { productId, quantity } = req.body;
    
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

    const validQuantity = Math.max(1, Math.min(quantity, productDoc.stock));

    const existingItemIndex = cart.items.findIndex(i => i.product.toString() === productId.toString());
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity = validQuantity;
    } else {
      cart.items.push({ product: productId, quantity: validQuantity });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    return successResponse(res, 200, "CART_ITEM_UPDATED", populatedCart);
  } catch (error) {
    console.error("[updateCartItem] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};

// DELETE /api/cart/items/:productId
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return errorResponse(res, 404, "CART_NOT_FOUND");
    }

    cart.items = cart.items.filter(i => i.product.toString() !== productId.toString());
    await cart.save();

    const populatedCart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name price salePrice saleStartDate saleEndDate images stock slug craftVillage category");
    return successResponse(res, 200, "CART_ITEM_REMOVED", populatedCart);
  } catch (error) {
    console.error("[removeCartItem] Error:", error);
    return errorResponse(res, 500, "SERVER_ERROR");
  }
};
