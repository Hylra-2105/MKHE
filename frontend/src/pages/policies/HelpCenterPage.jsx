import { useState, useEffect } from "react";
import { ChevronDown, MessageSquare, Search, FileQuestion, BookOpen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import policyApi from "@/api/policyApi";
import Button from "@/components/ui/Button";

// Custom Accordion Item
const AccordionItem = ({ title, content, isOpen, onClick }) => {
  return (
    <div className="border border-mkhe-border/30 rounded-xl overflow-hidden mb-3 bg-white/80 dark:bg-black/20 backdrop-blur-sm transition-all">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-mkhe-text hover:bg-mkhe-primary/5 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          size={20}
          className={`text-mkhe-text/50 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div 
          className="p-4 pt-0 border-t border-mkhe-border/10 prose prose-sm dark:prose-invert max-w-none text-mkhe-text/80"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
};

const HelpCenterPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await policyApi.getAll();
        if (res.data && res.data.success) {
          setPolicies(res.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching policies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const openChatbot = () => {
    // Kích hoạt sự kiện mở chatbot, tương tự nút nổi ở góc dưới
    const event = new CustomEvent('open-chatbot');
    window.dispatchEvent(event);
  };

  // Group policies by category based on search term
  const removeAccents = (str) => {
    return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : '';
  };

  const filteredPolicies = policies.filter(policy => {
    if (!searchTerm) return true;
    const searchNormalized = removeAccents(searchTerm);
    const titleNormalized = removeAccents(policy.title);
    const contentNormalized = removeAccents(policy.content); // Optional: strip html tags if wanted, but fine for basic search
    const categoryNormalized = removeAccents(policy.category);
    return titleNormalized.includes(searchNormalized) || 
           contentNormalized.includes(searchNormalized) || 
           categoryNormalized.includes(searchNormalized);
  });

  const groupedPolicies = filteredPolicies.reduce((acc, policy) => {
    const cat = policy.category || "Khác";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(policy);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-mkhe-text/50">Đang tải Trung tâm Trợ giúp...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mkhe-bg text-mkhe-text pt-32 pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-logo text-gradient-gold mb-4"
          >
            Trung tâm Trợ giúp
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-mkhe-text/70 mb-8"
          >
            Xin chào! Chúng tôi có thể giúp gì cho bạn hôm nay?
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-mkhe-text/40 group-focus-within:text-mkhe-primary transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm câu hỏi, hướng dẫn..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-mkhe-border/30 focus:border-mkhe-primary/50 focus:ring-2 focus:ring-mkhe-primary/20 outline-none transition-all shadow-sm group-hover:shadow-md text-mkhe-text"
            />
          </motion.div>
        </div>

        <div className="space-y-16">
          {Object.entries(groupedPolicies).map(([category, items], index) => (
            <motion.div 
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <h2 className="text-2xl font-bold font-logo text-mkhe-primary mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-mkhe-primary/10 flex items-center justify-center text-mkhe-primary">
                  <BookOpen size={20} />
                </div>
                {category}
              </h2>
              <div className="space-y-3">
                {items.map((policy) => (
                  <AccordionItem
                    key={policy._id}
                    title={policy.title}
                    content={policy.content}
                    isOpen={openItems[policy._id]}
                    onClick={() => toggleItem(policy._id)}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {filteredPolicies.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center p-16 bg-white/80 dark:bg-black/20 backdrop-blur-sm rounded-3xl border border-mkhe-border/30 shadow-sm"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-mkhe-primary/5 flex items-center justify-center text-mkhe-primary/50">
                <FileQuestion size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold font-logo mb-2 text-mkhe-text">
                {searchTerm ? "Không tìm thấy kết quả" : "Chưa có bài viết nào"}
              </h3>
              <p className="text-mkhe-text/50 max-w-md mx-auto">
                {searchTerm 
                  ? `Không có bài viết nào chứa từ khóa "${searchTerm}". Bạn có thể hỏi trực tiếp Chatbot ở bên dưới nhé.`
                  : "Chúng tôi đang cập nhật các bài viết hướng dẫn. Bạn có thể hỏi trực tiếp Chatbot ở bên dưới nhé."}
              </p>
            </motion.div>
          )}
        </div>

        {/* Chatbot CTA Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-br from-mkhe-primary via-[#D4AF37] to-mkhe-primary rounded-3xl p-8 md:p-12 text-white text-center shadow-[0_20px_50px_-12px_rgba(212,175,55,0.4)] relative overflow-hidden group"
        >
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/30 transform group-hover:-translate-y-2 transition-transform duration-500">
              <MessageSquare size={36} className="text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold font-logo mb-4">
              Chưa tìm thấy giải đáp?
            </h3>
            <p className="text-white/90 mb-10 max-w-xl mx-auto text-lg">
              Trợ lý AI của Mekong Heritage luôn sẵn sàng hỗ trợ bạn 24/7. Hãy đặt câu hỏi để nhận được câu trả lời ngay lập tức.
            </p>
            <button
              onClick={openChatbot}
              className="bg-white text-mkhe-primary font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-2 mx-auto group/btn"
            >
              Nhấn vào đây để hỏi Chatbot
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HelpCenterPage;
