import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBlogBySlugApi } from "@/api/blogApi";
import { Calendar, User, ChevronLeft, ChevronRight, Tag, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCartStore } from "@/stores/useCartStore";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const res = await getBlogBySlugApi(slug);
        if (res) {
          setBlog(res);
        }
      } catch (error) {
        toast.error("Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mkhe-bg flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mkhe-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-mkhe-bg flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-mkhe-text mb-4">Không tìm thấy bài viết</h2>
        <Link to="/storytelling" className="text-mkhe-primary hover:underline flex items-center gap-2">
          <ChevronLeft className="w-5 h-5" /> Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mkhe-bg pb-20">
      {/* Nút quay lại */}
      <div className="container mx-auto px-4 max-w-4xl pt-8">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 cursor-pointer text-mkhe-text/60 hover:text-mkhe-primary transition-colors mb-2 group text-sm font-semibold uppercase tracking-wider"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Quay lại
        </button>
      </div>

      <article className="container mx-auto px-4 max-w-4xl pt-10">
        {/* Header Bài viết */}
        <header className="mb-10 text-center">
          <div className="inline-block bg-mkhe-primary/20 text-mkhe-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            {blog.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-logo font-bold text-gradient-gold mb-6 leading-tight">
            {blog.title}
          </h1>
          {blog.summary && blog.summary.trim() !== "" && (
            <p className="text-lg text-mkhe-text/80 max-w-3xl mx-auto mb-8 leading-relaxed italic">
              "{blog.summary}"
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-mkhe-text/60 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("vi-VN", {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}</span>
            </div>
          </div>
        </header>

        {/* Thumbnail chính */}
        {blog.thumbnail && (
          <div className="mb-12 rounded-3xl overflow-hidden border border-mkhe-border/30 shadow-2xl">
            <img 
              src={blog.thumbnail} 
              alt={blog.title} 
              className="w-full h-auto max-h-[60vh] object-cover"
            />
          </div>
        )}

        {/* Nội dung bài viết */}
        <div 
          className="prose dark:prose-invert prose-lg max-w-none text-mkhe-text/90 marker:text-mkhe-primary prose-a:text-mkhe-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:border prose-img:border-mkhe-border/30 dark:[&_[style]]:!text-mkhe-text dark:[&_a]:!text-mkhe-primary"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Sản phẩm liên kết (Call to Action Mua Hàng) */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-16 bg-mkhe-border/10 rounded-3xl p-8 border border-mkhe-text/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-mkhe-primary to-transparent"></div>
            
            <h3 className="text-2xl font-bold text-gradient-gold mb-8 text-center uppercase tracking-widest">
              Sản phẩm liên quan đến bài viết
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {blog.tags.map(product => (
                <div 
                  key={product._id} 
                  className="group bg-mkhe-bg rounded-2xl p-4 border border-mkhe-border/50 flex items-center gap-4 hover:border-mkhe-primary transition-colors hover:shadow-lg hover:shadow-mkhe-primary/5"
                >
                  <Link to={`/shop/${product._id}`} className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-black/20 block">
                    <img 
                      src={product.images?.[0] || "/placeholder.jpg"} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <Link to={`/shop/${product._id}`} className="block">
                      <h4 className="font-bold text-mkhe-text group-hover:text-mkhe-primary transition-colors line-clamp-2 mb-1">
                        {product.name}
                      </h4>
                      <p className="text-mkhe-primary font-semibold">
                        {product.price.toLocaleString("vi-VN")} ₫
                      </p>
                    </Link>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <Link to={`/shop/${product._id}`} className="flex items-center text-xs text-mkhe-text/50 uppercase font-bold group-hover:text-mkhe-primary transition-colors">
                        <span className="mr-1">Xem chi tiết</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="w-8 h-8 rounded-full bg-mkhe-primary/10 flex items-center justify-center text-mkhe-primary hover:bg-mkhe-primary hover:text-white transition-colors cursor-pointer"
                        title="Thêm vào giỏ hàng"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

export default BlogDetail;
