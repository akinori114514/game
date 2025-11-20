const SALES_COEFFICIENT = 8;
const PRODUCT_QUALITY_COEFFICIENT = 0.4;

const clampChance = (value: number) => {
  return Math.max(0.05, Math.min(0.95, value));
};

export const calculateDealSuccess = (
  pmf: number,
  salesCount: number,
  productQuality: number,
  cardEffects: number,
  resistance: number
) => {
  if (resistance <= 0) {
    return 0.95;
  }
  const numerator =
    pmf +
    salesCount * SALES_COEFFICIENT +
    productQuality * PRODUCT_QUALITY_COEFFICIENT +
    cardEffects;

  const chance = numerator / resistance;
  return clampChance(chance);
};
