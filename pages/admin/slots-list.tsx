import React from 'react';
import type { GetServerSideProps } from 'next';
import MainLayout from '../../layouts/MainLayout';
import { requireEmployee } from '../../utils/ssrAuth';

export type PageProps = {
  userName: string;
  userPhoto: string;
  roleId: string;
};

export default function SlotsListPage({ userName, userPhoto, roleId }: PageProps) {
  return (
    <MainLayout userName={userName} userPhoto={userPhoto} roleId={roleId}>
      <SlotsList />
    </MainLayout>
  );
}

const SlotsList: React.FC = () => {
  return <div>SlotsList</div>;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (ctx) => {
  const auth = await requireEmployee(ctx, { allowedRoleIds: [1, 2] });
  if (auth.kind === 'redirect') {
    return {
      redirect: {
        destination: auth.destination,
        permanent: false,
      },
    };
  }

  return {
    props: {
      userName: auth.employee.fullName,
      userPhoto: auth.employee.employeePhoto,
      roleId: auth.employee.facilityRoleName,
    },
  };
};
