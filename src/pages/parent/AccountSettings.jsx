import React from 'react';
import ParentLayout from '../../components/parent/layout/ParentLayout';
import AccountSettings from '../../components/parent/account-settings/AccountSettings';
import { AccountStatusCard } from '../../components/account-settings/AccountRegistrationStatus';

const AccountSettingsPage = () => (
  <ParentLayout>
    <div className="mb-5"><AccountStatusCard /></div>
    <AccountSettings />
  </ParentLayout>
);

export default AccountSettingsPage;
