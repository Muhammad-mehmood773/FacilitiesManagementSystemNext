import React from 'react';
import MainLayout from '../../layouts/MainLayout';

export default function SlotsListPage() {
  return (
    <MainLayout>
      <SlotsList />
    </MainLayout>
  );
}

const SlotsList: React.FC = () => {
  return <div>SlotsList</div>;
};
