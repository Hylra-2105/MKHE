import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Copy, Plus, Cpu, AlertCircle } from "lucide-react";
import { nfcApi } from "@/api/nfcApi";
import { useTranslation } from "react-i18next";

const NFCManagement = ({ productId }) => {
  const { t } = useTranslation("product");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generateCount, setGenerateCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await nfcApi.getTagsByProduct(productId);
      if (res.success) {
        setTags(res.data);
      }
    } catch (error) {
      toast.error(t("messages.load_nfc_error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchTags();
    }
  }, [productId]);

  const handleGenerate = async () => {
    if (!generateCount || generateCount <= 0 || generateCount > 100) {
      return toast.error("Số lượng hợp lệ từ 1 đến 100");
    }
    
    setIsGenerating(true);
    try {
      const res = await nfcApi.generateTags(productId, generateCount);
      if (res.success) {
        toast.success(t("messages.generate_nfc_success", { count: generateCount }));
        fetchTags();
      }
    } catch (error) {
      toast.error(t("messages.generate_nfc_error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleActivate = async (uid) => {
    try {
      const res = await nfcApi.activateTag(uid);
      if (res.success) {
        toast.success(t("messages.activate_success", { uid }));
        fetchTags(); 
      }
    } catch (error) {
      toast.error(t("messages.activate_error"));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("messages.copy_link_success"));
    } catch (error) {
      toast.error(t("messages.copy_link_error"));
    }
  };

  return (
    <div className="p-4 bg-mkhe-primary/5 rounded-2xl border border-mkhe-border/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-mkhe-primary/10 rounded-xl border border-mkhe-primary/20 mt-1">
            <Cpu className="w-6 h-6 text-mkhe-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-mkhe-text">{t("nfc.management_title")}</h3>
            <p className="text-xs text-mkhe-text/60 mt-1 max-w-sm">
              {t("nfc.management_desc")}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center bg-[var(--color-mkhe-bg)] border border-[var(--color-mkhe-border)]/40 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={() => setGenerateCount(Math.max(1, generateCount - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mkhe-primary/20 text-mkhe-text/70 hover:text-mkhe-primary transition-colors cursor-pointer text-lg"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="100"
              value={generateCount}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val >= 1 && val <= 100) setGenerateCount(val);
              }}
              className="w-10 bg-transparent border-none text-mkhe-text focus:outline-none text-center font-bold text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setGenerateCount(Math.min(100, generateCount + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mkhe-primary/20 text-mkhe-text/70 hover:text-mkhe-primary transition-colors cursor-pointer text-lg"
            >
              +
            </button>
          </div>
          
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-mkhe-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-mkhe-primary/90 hover:shadow-[0_0_15px_rgba(var(--color-mkhe-primary-rgb),0.3)] hover:-translate-y-0.5 whitespace-nowrap"
          >
            {isGenerating ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isGenerating ? t("nfc.generating") : t("nfc.generate")}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-mkhe-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tags.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-mkhe-text/20 mb-3" />
          <p className="text-sm font-medium text-mkhe-text/60">{t("nfc.no_tags")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-mkhe-border/20">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-mkhe-border/10 text-mkhe-text/70 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="p-3 pl-4">{t("nfc.uid")}</th>
                <th className="p-3">{t("nfc.status")}</th>
                <th className="p-3 min-w-[300px]">{t("nfc.url")}</th>
                <th className="p-3 text-right pr-4">{t("nfc.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mkhe-border/20 text-mkhe-text">
              {tags.map((tag) => {
                const url = `${window.location.origin}/dpp/${tag.uid}?hash=${tag.hash}`;
                const isPending = tag.status === "PENDING";
                
                return (
                  <tr key={tag._id} className="hover:bg-mkhe-border/5 transition-colors">
                    <td className="p-3 pl-4 font-mono font-bold text-xs">{tag.uid}</td>
                    <td className="p-3">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                          PENDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/20 text-green-600 dark:text-green-400">
                           ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 max-w-[400px]">
                        <input
                          type="text"
                          readOnly
                          value={url}
                          className="w-full bg-black/5 border border-mkhe-border/30 rounded px-2 py-1 text-[11px] text-mkhe-text/70 truncate focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(url)}
                          className="p-1.5 hover:bg-mkhe-primary/20 text-mkhe-primary cursor-pointer rounded transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => handleActivate(tag.uid)}
                          className="text-[11px] font-bold text-white cursor-pointer bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded shadow transition-colors"
                        >
                          {t("nfc.confirm_written")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default NFCManagement;
