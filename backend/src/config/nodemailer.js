import nodemailer from "nodemailer";

let transporter = null;

// Lazy-load transporter khi cần dùng
export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
};

export { getTransporter as transporter };
