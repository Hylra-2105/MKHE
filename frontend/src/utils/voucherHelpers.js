export const checkVoucherEligibility = (voucher, cartItems, cartTotal) => {
  if (cartTotal < voucher.minOrderValue) {
    return {
      isEligible: false,
      reason: `amount_needed`,
      amountNeeded: voucher.minOrderValue - cartTotal
    };
  }

  // Check categories/villages if any
  const hasCategoryRestriction = voucher.applicableCategories && voucher.applicableCategories.length > 0;
  const hasVillageRestriction = voucher.applicableVillages && voucher.applicableVillages.length > 0;

  if (hasCategoryRestriction || hasVillageRestriction) {
    const isItemValid = cartItems.some((item) => {
      let validCat = true;
      let validVill = true;
      if (hasCategoryRestriction) {
        validCat = voucher.applicableCategories.some((c) => c === item.product.categoryMatrix || c === item.product.category);
      }
      if (hasVillageRestriction) {
        validVill = voucher.applicableVillages.some((v) => v === item.product.craftVillage);
      }
      return validCat && validVill;
    });

    if (!isItemValid) {
      return {
        isEligible: false,
        reason: "invalid_category_village",
      };
    }
  }

  return { isEligible: true, reason: null };
};
