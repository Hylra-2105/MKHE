import dotenv from "dotenv";
dotenv.config();

async function testPayOS() {
  try {
    const payosModule = await import("@payos/node");
    const PayOS = payosModule.default.PayOS;
    
    const payos = new PayOS({
      clientId: process.env.PAYOS_CLIENT_ID,
      apiKey: process.env.PAYOS_API_KEY,
      checksumKey: process.env.PAYOS_CHECKSUM_KEY
    });
    
    const body = {
      orderCode: Number(String(Date.now()).slice(-9) + Math.floor(Math.random() * 1000)),
      amount: 10000,
      description: "Test PayOS",
      returnUrl: "http://localhost:5173/checkout/success?status=PAID",
      cancelUrl: "http://localhost:5173/checkout/success?cancel=true",
    };
    
    const response = await payos.paymentRequests.create(body);
    console.log("SUCCESS:", response.checkoutUrl);
  } catch (error) {
    console.error("PAYOS ERROR:", error);
  }
}

testPayOS();
