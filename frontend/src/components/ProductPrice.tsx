import React from "react";
import {
  formatPrice,
  discountPrice,
  installmentPrice,
  parsePrice,
} from "@/utils/formatPrice";

interface ProductPriceProps {
  price: string | number | undefined;
  discount?: number; // default 0.1 = 10%
  installments?: number; // default 3
}

export const ProductPrice = ({
  price,
  discount = 0.1,
  installments = 3,
}: ProductPriceProps) => {
  const basePrice = parsePrice(price);

  if (isNaN(basePrice)) return <p>No disponible</p>;

  const discounted = discountPrice(basePrice, discount);
  const installment = installmentPrice(basePrice, installments);

  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold text-green-700">
        {formatPrice(basePrice)}
      </p>
      <p className="text-sm text-gray-700">
        <span className="font-semibold text-green-700">
          {formatPrice(discounted)}
        </span>{" "}
        pagando por transferencia ({discount * 100}% OFF)
      </p>
      <p className="text-sm text-gray-700">
        {installments} cuotas sin interés de{" "}
        <span className="font-semibold text-green-700">
          {formatPrice(installment)}
        </span>
      </p>
    </div>
  );
};
