/**
 * Trả về Response khi thao tác THÀNH CÔNG
 */
export const successResponse = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Trả về Response khi có LỖI xảy ra
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};