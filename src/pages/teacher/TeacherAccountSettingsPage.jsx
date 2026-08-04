import React from 'react';
import TeacherLayout from '../../components/teacher/layout/TeacherLayout';
import TeacherAccountSettings from '../../components/teacher/account-settings/TeacherAccountSettings';
import { AccountStatusCard } from '../../components/account-settings/AccountRegistrationStatus';

const TeacherAccountSettingsPage = () => (
  <TeacherLayout>
    <div className="mb-5"><AccountStatusCard /></div>
    <TeacherAccountSettings />
  </TeacherLayout>
);

export default TeacherAccountSettingsPage;
