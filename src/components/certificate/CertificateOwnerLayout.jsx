import { useContext } from 'react';
import StudentLayout from '../student/layout/StudentLayout';
import TeacherLayout from '../teacher/layout/TeacherLayout';
import ParentLayout from '../parent/layout/ParentLayout';
import { AuthContext } from '../../context/AuthContext';
import { isInstructor } from '../../utils/roles';

export default function CertificateOwnerLayout({ children }) {
  const { user } = useContext(AuthContext);
  const Layout = user?.role === 'teacher' || isInstructor(user)
    ? TeacherLayout
    : user?.role === 'parent' ? ParentLayout : StudentLayout;
  return <Layout marketplaceOnly={user?.role === 'user' && !isInstructor(user)}>{children}</Layout>;
}
