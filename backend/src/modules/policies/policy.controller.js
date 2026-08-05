import Policy from "./policy.model.js";
import { successResponse, errorResponse } from "../../utils/response.js";

// @desc    Get all policies
// @route   GET /api/policies
// @access  Public (if Active only) / Admin (All)
export const getPolicies = async (req, res) => {
  try {
    const isAdmin = req.user && (req.user.role === "Admin" || req.user.role === "Staff");
    
    let query = {};
    if (!isAdmin) {
      query.isActive = true;
    }
    
    // Default sorting by category and title
    const policies = await Policy.find(query).sort({ category: 1, title: 1 });
    
    return successResponse(res, 200, "Fetch policies success", policies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    return errorResponse(res, 500, "Server Error");
  }
};

// @desc    Get policy by slug
// @route   GET /api/policies/:slug
// @access  Public
export const getPolicyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const policy = await Policy.findOne({ slug, isActive: true });
    
    if (!policy) {
      return errorResponse(res, 404, "Policy not found");
    }
    
    return successResponse(res, 200, "Fetch policy success", policy);
  } catch (error) {
    console.error("Error fetching policy by slug:", error);
    return errorResponse(res, 500, "Server Error");
  }
};

// @desc    Create a policy
// @route   POST /api/policies
// @access  Private/Admin
export const createPolicy = async (req, res) => {
  try {
    const { title, slug, content, category, isActive } = req.body;
    
    if (!title || !slug || !content || !category) {
      return errorResponse(res, 400, "Please provide all required fields");
    }
    
    const existingPolicy = await Policy.findOne({ slug });
    if (existingPolicy) {
      return errorResponse(res, 400, "Slug already exists");
    }
    
    const policy = await Policy.create({
      title,
      slug,
      content,
      category,
      isActive: isActive !== undefined ? isActive : true,
    });
    
    return successResponse(res, 201, "Policy created successfully", policy);
  } catch (error) {
    console.error("Error creating policy:", error);
    return errorResponse(res, 500, "Server Error");
  }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private/Admin
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, content, category, isActive } = req.body;
    
    const policy = await Policy.findById(id);
    if (!policy) {
      return errorResponse(res, 404, "Policy not found");
    }
    
    if (slug && slug !== policy.slug) {
      const existingPolicy = await Policy.findOne({ slug });
      if (existingPolicy) {
        return errorResponse(res, 400, "Slug already exists");
      }
    }
    
    policy.title = title || policy.title;
    policy.slug = slug || policy.slug;
    policy.content = content || policy.content;
    policy.category = category || policy.category;
    if (isActive !== undefined) policy.isActive = isActive;
    
    const updatedPolicy = await policy.save();
    
    return successResponse(res, 200, "Policy updated successfully", updatedPolicy);
  } catch (error) {
    console.error("Error updating policy:", error);
    return errorResponse(res, 500, "Server Error");
  }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    
    const policy = await Policy.findById(id);
    if (!policy) {
      return errorResponse(res, 404, "Policy not found");
    }
    
    await policy.deleteOne();
    
    return successResponse(res, 200, "Policy deleted successfully");
  } catch (error) {
    console.error("Error deleting policy:", error);
    return errorResponse(res, 500, "Server Error");
  }
};
