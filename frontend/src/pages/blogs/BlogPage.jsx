import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBlogsApi } from "@/api/blogApi";
import { Calendar, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

const BlogPage = () => {
  const { t, i18n } = useTranslation("blog");
  const location = useLocation();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mặc định Ký sự nếu vào /storytelling
  const isStorytelling = location.pathname.includes("storytelling");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const query = { status: "PUBLISHED" };
        if (isStorytelling) {
          query.category = "Ký sự";
        }
        const res = await getBlogsApi(query);
        if (res && res.blogs) {
          setBlogs(res.blogs);
        }
      } catch (error) {
        toast.error(t("blog:fetch_list_error"));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [isStorytelling, t]);

  return (
    <div className="min-h-screen bg-mkhe-bg py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-logo font-bold text-gradient-gold uppercase mb-4 tracking-widest">
            {isStorytelling ? t("public.page_title_story") : t("public.page_title_blog")}
          </h1>
          <p className="text-mkhe-text/70 max-w-2xl mx-auto text-sm">
            {isStorytelling ? t("public.page_desc_story") : t("public.page_desc_blog")}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkhe-primary"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-mkhe-input rounded-2xl border border-mkhe-border/50">
            <p className="text-mkhe-text/60">{t("public.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link 
                key={blog._id} 
                to={`/blogs/${blog.slug}`}
                className="group flex flex-col bg-mkhe-input rounded-2xl overflow-hidden border border-mkhe-border/80 hover:border-mkhe-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-mkhe-primary/10"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative overflow-hidden bg-black/50">
                  <img 
                    src={blog.thumbnail || "/placeholder.jpg"} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-mkhe-primary text-black text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    {t(`admin.editor.categories.${blog.category}`, { defaultValue: blog.category })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-mkhe-text/50 uppercase font-semibold mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : (i18n.language === 'en' ? 'en-US' : (i18n.language === 'ko' ? 'ko-KR' : (i18n.language === 'ja' ? 'ja-JP' : 'zh-CN'))))}</span>
                  </div>

                  <h3 className="text-lg font-bold text-mkhe-text mb-3 line-clamp-2 group-hover:text-mkhe-primary transition-colors">
                    {blog.title}
                  </h3>

                  <p className="text-sm text-mkhe-text/70 line-clamp-3 mb-6 flex-1">
                    {blog.summary}
                  </p>

                  <div className="mt-auto pt-4">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mkhe-text text-mkhe-bg hover:opacity-80 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer group">
                      <span>{t("public.btn_read_more")}</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
