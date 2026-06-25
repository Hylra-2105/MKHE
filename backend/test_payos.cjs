require("dotenv").config();
const PayOS = require("@payos/node");

async function testPayOS() {
  try {
    const payos = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY
    );
    
    const body = {
      orderCode: Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 1000)),
      amount: 10000,
      description: "Test PayOS",
      returnUrl: "http://localhost:5173",
      cancelUrl: "http://localhost:5173",
    };
    
    const response = await payos.createPaymentLink(body);
    console.log("SUCCESS:", response.checkoutUrl);
  } catch (error) {
    console.error("PAYOS ERROR:", error);
  }
}

testPayOS();
