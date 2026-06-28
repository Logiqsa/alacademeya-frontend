import React from 'react';
import ParentLayout from '../../components/parent/layout/ParentLayout';
import AccountSettings from '../../components/parent/account-settings/AccountSettings';

/**
 * Page route: /parent/account-settings
 * Wraps AccountSettings inside the standard ParentLayout (sidebar + shell).
 */
const AccountSettingsPage = () => (
  <ParentLayout>
    <AccountSettings />
  </ParentLayout>
);

export default AccountSettingsPage;