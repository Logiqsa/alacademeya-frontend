import React from 'react';
import StudentLayout from '../../components/student/layout/StudentLayout';
import StudentAccountSettings from '../../components/student/account-settings/StudentAccountSettings';
import { AccountStatusCard } from '../../components/account-settings/AccountRegistrationStatus';


const StudentAccountSettingsPage = () => (
  <StudentLayout>
    <div className="mb-5"><AccountStatusCard /></div>
    <StudentAccountSettings />
  </StudentLayout>
);

export default StudentAccountSettingsPage;
