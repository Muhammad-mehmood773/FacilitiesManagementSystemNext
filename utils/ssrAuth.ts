import type { GetServerSidePropsContext } from 'next';
import type { EmployeeResponse } from '../interfaces/employeeResponse';
import { createServerApi } from '../api/serverApi';
import { getCookieValue } from './cookies';

export type SsrEmployee = EmployeeResponse['data'];

export const getLoginIdFromContext = (ctx: GetServerSidePropsContext): string | null => {
  const cookieHeader = ctx.req.headers.cookie;
  const loginId = getCookieValue(cookieHeader, 'loginId');
  return loginId && loginId.trim() ? loginId : null;
};

export const fetchEmployeeForSsr = async (loginId: string): Promise<SsrEmployee | null> => {
  const api = createServerApi(loginId);
  const res = await api.get<EmployeeResponse>(
    `/FacilityEmployee/get-employee-by-id?employeeId=${encodeURIComponent(loginId)}`
  );

  if (!res.data?.success || !res.data?.data) return null;
  return res.data.data;
};

export const requireEmployee = async (
  ctx: GetServerSidePropsContext,
  options: { allowedRoleIds?: number[]; redirectTo?: string } = {}
): Promise<
  | { kind: 'redirect'; destination: string }
  | { kind: 'ok'; loginId: string; employee: SsrEmployee }
> => {
  const redirectTo = options.redirectTo ?? '/unauthorized';
  const loginId = getLoginIdFromContext(ctx);

  if (!loginId) {
    return { kind: 'redirect', destination: redirectTo };
  }

  try {
    const employee = await fetchEmployeeForSsr(loginId);
    if (!employee) return { kind: 'redirect', destination: redirectTo };

    if (options.allowedRoleIds?.length) {
      if (!options.allowedRoleIds.includes(employee.facilityRoleId)) {
        return { kind: 'redirect', destination: redirectTo };
      }
    }

    return { kind: 'ok', loginId, employee };
  } catch {
    return { kind: 'redirect', destination: redirectTo };
  }
};
