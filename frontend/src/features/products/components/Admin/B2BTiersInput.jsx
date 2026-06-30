import React, { useState } from 'react';
import { Plus, Trash2, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '@/components/ui/ConfirmModal';

const B2BTiersInput = ({ tiers = [], onChange, error }) => {
  const { t } = useTranslation(['product']);
  
  const [deleteTierIndex, setDeleteTierIndex] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const addTier = () => {
    onChange([...tiers, { minQuantity: '', discountPercent: '' }]);
  };

  const handleRemoveClick = (index) => {
    setDeleteTierIndex(index);
    setIsConfirmOpen(true);
  };

  const confirmRemoveTier = () => {
    if (deleteTierIndex !== null) {
      const newTiers = [...tiers];
      newTiers.splice(deleteTierIndex, 1);
      onChange(newTiers);
      setDeleteTierIndex(null);
    }
    setIsConfirmOpen(false);
  };

  const cancelRemoveTier = () => {
    setDeleteTierIndex(null);
    setIsConfirmOpen(false);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange(newTiers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-mkhe-primary">{t('product:products.b2b.tiers_title')}</h3>
          <div className="group relative">
            <Info className="w-4 h-4 text-mkhe-text hover:text-mkhe-primary cursor-pointer transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-mkhe-input border border-mkhe-border text-mkhe-text text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center">
              {t('product:products.b2b.tiers_info')}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-mkhe-border"></div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={addTier}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium cursor-pointer text-mkhe-primary bg-mkhe-primary/10 hover:bg-mkhe-primary/20 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('product:products.b2b.add_tier')}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
          <AlertCircle className="w-4 h-4 shrink-0 mt-[2px]" />
          <p className="text-xs font-medium leading-relaxed">{error}</p>
        </div>
      )}

      {tiers.length === 0 ? (
        <div className="p-4 bg-mkhe-border/5 rounded-xl border border-dashed border-mkhe-border/30 text-center">
          <p className="text-sm text-mkhe-text/50">{t('product:products.b2b.no_tiers')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-mkhe-border/5 rounded-xl border border-mkhe-border/10">
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t('product:products.b2b.min_quantity')}</label>
                <input
                  type="number"
                  min="1"
                  value={tier.minQuantity}
                  onChange={(e) => updateTier(index, 'minQuantity', e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-mkhe-border/50 focus:border-mkhe-primary text-mkhe-text rounded-lg focus:outline-none transition-colors text-sm"
                  placeholder={t('product:products.b2b.min_quantity_placeholder')}
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-mkhe-text/50 uppercase ml-1 block">{t('product:products.b2b.discount_percent')}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={tier.discountPercent}
                  onChange={(e) => updateTier(index, 'discountPercent', e.target.value)}
                  className="w-full p-2.5 bg-transparent border border-mkhe-border/50 focus:border-mkhe-primary text-mkhe-text rounded-lg focus:outline-none transition-colors text-sm"
                  placeholder={t('product:products.b2b.discount_placeholder')}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveClick(index)}
                className="p-2.5 mt-5 cursor-pointer text-mkhe-text/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title={t('product:products.b2b.remove_tier')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onConfirm={confirmRemoveTier}
        onCancel={cancelRemoveTier}
        title={t('product:products.b2b.delete_confirm_title', 'Xóa mốc chiết khấu?')}
        message={t('product:products.b2b.delete_confirm_msg', 'Bạn có chắc chắn muốn xóa mốc chiết khấu này không? Hành động này không thể hoàn tác.')}
        confirmText={t('product:products.b2b.delete_confirm_yes', 'Xóa mốc')}
        cancelText={t('product:products.b2b.delete_confirm_no', 'Hủy')}
        isDanger={true}
        icon="trash"
      />
    </div>
  );
};

export default B2BTiersInput;
