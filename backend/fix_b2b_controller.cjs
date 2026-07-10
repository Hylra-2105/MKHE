const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'modules', 'b2b', 'b2b.controller.js');
let content = fs.readFileSync(filePath, 'utf-8');

// The file is currently:
// 1: import Product from "../products/product.model.js";
// 2: import User from "../users/user.model.js";
// 3: import B2BOrder from "./b2bOrder.model.js";
// 4: import Notification from "../notifications/notification.model.js";
// 5:         limit,
// 6:       },
// 7:       data: products,
// ...

const missingCode = `import { getIO } from "../../config/socket.js";
import { successResponse, errorResponse } from "../../utils/response.js";
import { createVietnameseRegex } from "../../utils/helpers.js";

// [GET] /api/b2b/products
export const getB2BProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || "";
    const category = req.query.category || "";

    const skip = (page - 1) * limit;

    let query = {
      status: { $in: ["PUBLISHED", "OUT_OF_STOCK"] },
      categoryMatrix: { $in: ["B2B_Luxury", "B2B_Standard"] },
    };

    if (search) {
      const searchRegex = createVietnameseRegex(search);
      query.$or = [
        { name: { $regex: searchRegex, $options: "i" } },
        { sku: { $regex: searchRegex, $options: "i" } },
      ];
    }

    if (category) {
      query.categoryMatrix = category;
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(res, 200, "GET_B2B_PRODUCTS_SUCCESS", {
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
`;

content = content.replace(
  `import Notification from "../notifications/notification.model.js";\r\n        limit,`,
  `import Notification from "../notifications/notification.model.js";\r\n${missingCode}        limit,`
);
content = content.replace(
  `import Notification from "../notifications/notification.model.js";\n        limit,`,
  `import Notification from "../notifications/notification.model.js";\n${missingCode}        limit,`
);

fs.writeFileSync(filePath, content);
console.log("Fixed b2b.controller.js");
