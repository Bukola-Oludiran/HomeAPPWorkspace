import { expect, test } from '@playwright/test';

const user = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', email: 'tenant@example.com', role: 'TENANT',
  firstName: 'Seeded', lastName: 'Tenant', phone: null, avatarUrl: null, emailVerified: true,
  twoFactorEnabled: false, verificationLevel: 'BRONZE', preferredCurrency: 'CAD', preferredLanguage: 'en',
  regionCode: 'CA', walletAddress: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
};

test('an invited tenant accepts once and reaches the real application route', async ({ page }) => {
  await page.addInitScript(storedUser => {
    localStorage.setItem('homeai_access_token', 'e2e-token');
    localStorage.setItem('homeai_refresh_token', 'e2e-refresh');
    localStorage.setItem('homeai_user', JSON.stringify(storedUser));
  }, user);

  await page.route('**/api/v1/**', async route => {
    const url = route.request().url();
    if (url.endsWith('/users/me')) return route.fulfill({ json: { success: true, data: user } });
    if (url.includes('/tenant/applicant-invitations/invite-token') && route.request().method() === 'GET') {
      return route.fulfill({ json: { success: true, data: { email: user.email, expiresAt: '2026-09-01T00:00:00.000Z', acceptedAt: null, property: { name: 'Seeded Home' }, landlord: { firstName: 'Seeded', lastName: 'Landlord' } } } });
    }
    if (url.includes('/tenant/applicant-invitations/invite-token') && route.request().method() === 'POST') {
      return route.fulfill({ status: 201, json: { success: true, data: { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' } } });
    }
    return route.fulfill({ status: 404, json: { success: false } });
  });

  await page.goto('/applicant-invitations/invite-token');
  await expect(page.getByText('Invitation to apply')).toBeVisible();
  await page.getByRole('button', { name: 'Accept invitation' }).click();
  await expect(page).toHaveURL(/\/tenant\/applications\/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb$/);
});
