import React from 'react';
import { CustomBouquetBuilder } from '../components/CustomBouquetBuilder';

export const CustomBouquetPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CustomBouquetBuilder />
    </div>
  );
};
