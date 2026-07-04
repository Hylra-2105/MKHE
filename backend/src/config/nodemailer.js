import nodemailer from "nodemailer";

let transporter = null;

// Lazy-load transporter khi cần dùng
export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Đảm bảo không bị timeout do IPv6 trên Render
      pool: true,
      maxConnections: 1,
      maxMessages: 10
    });
  }
  return transporter;
};

export { getTransporter as transporter };
