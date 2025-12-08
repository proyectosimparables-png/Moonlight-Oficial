//frontend/src/utils/formatPrice.ts

export const parsePrice = (rawPrice: string | number | undefined): number => {
    if (!rawPrice) return NaN;

    let cleaned = String(rawPrice).trim().replace(/[^0-9.,]/g, "");

    if (cleaned.includes(".") && !cleaned.includes(",")) cleaned = cleaned.replace(/\./g, "");
    if (cleaned.includes(",")) cleaned = cleaned.replace(",", ".");

    return Number(cleaned);
};

export const formatARS = (value: number) =>
    value.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export const formatPrice = (rawPrice: string | number | undefined) => {
    const price = parsePrice(rawPrice);
    return isNaN(price) ? "No disponible" : `$ ${formatARS(price)}`;
};

export const discountPrice = (price: number, discount = 0.1) => price * (1 - discount);
export const installmentPrice = (price: number, installments = 3) => price / installments;
