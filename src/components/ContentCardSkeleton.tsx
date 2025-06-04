"use client";

import { CARD_SIZES } from './cardSizes';

export default function ContentCardSkeleton() {
  return (
    <div className={`w-full ${CARD_SIZES.height} animate-pulse`}>
      <div className={`bg-gray-200 ${CARD_SIZES.embedHeight} rounded-t-lg border-b border-gray-200`}></div>
      <div className={`${CARD_SIZES.padding} space-y-3`}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
}
