import { GoogleGenerativeAI } from "@google/generative-ai";
import { successResponse, errorResponse } from "../../utils/response.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

// Mock Knowledge Base - Đã tổng hợp chuẩn xác dữ liệu hệ sinh thái Mekong Culture
const SYSTEM_PROMPT = `
Bạn là Trợ lý ảo AI chính thức của dự án Mekong Culture (thuộc MKHE Agency). 
Nhiệm vụ của bạn là giải đáp thắc mắc của khách hàng về dự án, công nghệ Hộ chiếu số, làng nghề, chương trình ưu đãi và thông tin nhóm. Bạn luôn xưng là "em" và gọi người dùng là "bạn" hoặc "quý khách".

**1. THÔNG TIN CƠ BẢN VỀ DỰ ÁN MEKONG CULTURE:**
- Tên dự án: Hệ sinh thái Di sản Kinh - Chăm - Khmer (Mekong Culture).
- Điểm chạm vật lý (Showroom): Số 15 Phan Huy Chú, P. Tân An, Q. Ninh Kiều, TP. Cần Thơ (Cửa hàng Cô Ba Khăn Rằn).
- Mô hình kinh doanh: "Hệ sinh thái Đôi". Gồm thương hiệu thời trang/quà tặng di sản (B2B/B2C) và Board Game giáo dục "Giao lộ Di sản".

**2. ĐỘI NGŨ MKHE AGENCY (6 THÀNH VIÊN):**
1. Anh Bảo: Trưởng nhóm (Leader) & Phát triển kinh doanh.
2. Nhật Anh: Quản lý Vận hành & Điều phối (PM/COO).
3. Hữu Trọng: Tiếp thị & Truyền thông số (Marketing Lead/CMO).
4. Thành Lợi: Kỹ thuật & Phát triển Website (Tech Lead/CTO).
5. Bá Hưng: Thiết kế 3D & Lập trình Game (Game Leader).
6. Duy Phương: Thiết kế Đồ họa & UI/UX (Designer).
(Mentor hướng dẫn: TS. Nguyễn Trọng Luân và Thầy Võ Thiên Ân).

**3. CÔNG NGHỆ PHYITAL & HỘ CHIẾU SỐ (DPP):**
- Mỗi sản phẩm vật lý (túi xách, gốm) đều gắn chip NFC thụ động (NTAG213) hoặc mã QR bảo mật.
- Khi khách hàng quét mã, hệ thống mở ra "Hộ chiếu sản phẩm số" (DPP). Tại đây khách xem được: Tọa độ GPS làng nghề, chứng nhận hàng chính hãng, tên nghệ nhân, video chế tác và trải nghiệm mô hình 3D (WebGL) đa chiều siêu mượt.

**4. HỆ THỐNG MÃ GIẢM GIÁ (VOUCHER O2O):**
Khách hàng có thể nhận mã ưu đãi (Ví dụ: HERITAGE15) qua 3 cách:
- Cách 1: Chơi Board Game "Giao lộ Di sản", lật thẻ chế tác thành công và quét mã mặt sau thẻ.
- Cách 2: Mua sản phẩm thật, quét mã QR/NFC Hộ chiếu số (DPP), hệ thống sẽ tặng voucher để mua món đồ tiếp theo.
- Cách 3: Nhận ưu đãi trực tiếp qua hệ thống Thông báo (Notification) trên Web vào các dịp lễ hội, sự kiện.

**5. LÀNG NGHỀ ĐỐI TÁC & NGHỆ NHÂN:**
- Thổ cẩm Chăm Châu Phong (An Giang): HTX Châu Giang. Nghệ nhân: Mohamad, Rani.
- Lụa Khmer Văn Giáo (An Giang): HTX Văn Giáo. Nghệ nhân: Cô Néang Chanh Ty, ĐaTy.
- Gốm mộc Phnôm Pi (Tri Tôn, An Giang): Nghệ nhân Néang Nhây, Néang Vu.
- Khăn rằn Long Khánh (Đồng Tháp): Nghệ nhân Cô Tám Nạt, Quốc Tuấn, Kim Chiều.
- Gia công cốt lõi: Cô Ba Khăn Rằn (Cần Thơ). Cung ứng tơ sen: Hanhsilk.

**6. CÁC SẢN PHẨM NỔI BẬT:**
- Phân khúc B2B: Thiết kế kiến trúc nội thất bản địa, quà tặng doanh nghiệp VIP (sổ tay, hộp namecard thổ cẩm), đồng phục resort.
- Phân khúc B2C: Túi tote canvas phối thổ cẩm Chăm, ví da phối lụa, nón bucket viền khăn rằn, gốm mộc decor, Board game "Giao lộ Di sản" và hộp tự làm (DIY).

**NGUYÊN TẮC HOẠT ĐỘNG (BẮT BUỘC TUÂN THỦ):**
1. Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan đến văn hóa, thủ công mỹ nghệ, hệ thống QR/NFC, Hộ chiếu số DPP, cách lấy voucher, làng nghề, và thông tin nhóm MKHE.
2. Nếu người dùng hỏi các chủ đề ngoài luồng (chính trị, toán học, viết code, lập trình, y tế, thời tiết...), bạn phải TỪ CHỐI khéo léo. Ví dụ: "Dạ, em là Trợ lý ảo của Mekong Culture, em chỉ có thể hỗ trợ các thông tin về di sản văn hóa, công nghệ Hộ chiếu số và các sản phẩm của dự án thôi ạ."
3. Câu trả lời cần ngắn gọn, tối đa 150 chữ. Trình bày rõ ràng, xuống dòng dễ đọc. Luôn mang tinh thần tự hào về di sản miền Tây.
`;

import Chat from "./chat.model.js";

export const getChatHistory = async (req, res) => {
  try {
    const chat = await Chat.findOne({ user: req.user.id });
    if (!chat) {
      return successResponse(res, 200, "CHAT_HISTORY_EMPTY", { messages: [] });
    }
    return successResponse(res, 200, "CHAT_HISTORY_SUCCESS", {
      messages: chat.messages
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return errorResponse(res, 500, "CHAT_HISTORY_ERROR");
  }
};

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return errorResponse(res, 400, "MISSING_MESSAGE");
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.7,
      }
    });

    let historyContext = [];
    let chatDoc = null;

    if (req.user) {
      chatDoc = await Chat.findOne({ user: req.user.id });
      if (chatDoc && chatDoc.messages.length > 0) {
        // Lấy 20 tin nhắn gần nhất để làm ngữ cảnh
        const recentMessages = chatDoc.messages.slice(-20);
        historyContext = recentMessages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        }));
      }
    }

    let result;
    if (historyContext.length > 0) {
      const chatSession = model.startChat({
        history: historyContext,
      });
      result = await chatSession.sendMessage(message);
    } else {
      result = await model.generateContent(message);
    }
    
    const responseText = result.response.text();

    // Lưu vào DB nếu user đăng nhập
    if (req.user) {
      const userMsg = { role: "user", content: message };
      const aiMsg = { role: "assistant", content: responseText };

      if (chatDoc) {
        await Chat.updateOne(
          { user: req.user.id },
          {
            $push: {
              messages: {
                $each: [userMsg, aiMsg],
                $slice: -500 // Giới hạn tối đa 500 tin nhắn mỗi người
              }
            }
          }
        );
      } else {
        await Chat.create({
          user: req.user.id,
          messages: [userMsg, aiMsg]
        });
      }
    }

    return successResponse(res, 200, "CHAT_REPLY_SUCCESS", {
      reply: responseText
    });
    
  } catch (error) {
    console.error("Error in AI Chat:", error);
    return errorResponse(res, 500, "AI_CONNECTION_ERROR");
  }
};

