import React, { useEffect, useState, useCallback } from 'react';
import { User, Loader2, GraduationCap, BookOpen, Globe, Phone, Mail, AtSign, Calendar, Shield, Camera } from 'lucide-react';
import { getMyProfile, getMyStudents } from '../../../services/authService';
import { useNavigate } from "react-router-dom";

/* ─── helpers ─── */
function readableName(v) {
  if (!v) return '—';
  if (typeof v === 'string') return v || '—';
  return v?.name?.ar || v?.name?.en || '—';
}
function orDash(v) { return v || '—'; }
function langLabel(code) {
  return code === 'ar' ? 'العربية' : code === 'en' ? 'الإنجليزية' : orDash(code);
}

/* ─── DataRow ─── */
const DataRow = ({ label, value }) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <span className="text-xs text-[var(--text-light)]">{label}</span>
    <span className="text-sm font-semibold text-[var(--text-dark)] break-words">{value || '—'}</span>
  </div>
);


/* ─── SectionCard ─── */
/* ─── SectionCard ─── */
const SectionCard = ({ title, subtitle, children, editLabel, onEditClick }) => (
  <div className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] p-6">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-base font-bold text-[var(--text-dark)]">{title}</h3>
        {subtitle && (
          <p className="text-xs text-[var(--text-light)] mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors shrink-0 whitespace-nowrap"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>

          {editLabel || "تعديل البيانات"}
        </button>
      )}
    </div>

    <div className="border border-[var(--border-light)] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
      {children}
    </div>
  </div>
);

/* ─── TabButton ─── */
const TabButton = ({ label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
      isActive ? 'text-[var(--primary)]' : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
    }`}
  >
    {label}
    {isActive && <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--primary)] rounded-full" />}
  </button>
);

/* ══════════════════════════════════════════════════════════════════ */
const AccountView = ({ onNavigateToEdit }) => {
  const navigate = useNavigate();

  const handleNavigateToEdit = (id, section) => {
    navigate(`/parent/settings/edit?id=${id}&section=${section}`);
  };
  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('parent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, studentsRes] = await Promise.all([getMyProfile(), getMyStudents()]);
      const outerData = profileRes?.data?.data ?? {};
      const userNode = outerData.user ?? {};
      setParent({ ...outerData, ...userNode });
      const rawStudents = studentsRes?.data?.data;
      setStudents(Array.isArray(rawStudents) ? rawStudents : []);
    } catch {
      setError('حدث خطأ أثناء تحميل البيانات، حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const activeStudent = activeTab !== 'parent' ? students.find((s) => s.id === activeTab) : null;

  return (
    <div className="space-y-5" dir="rtl">

      {/* Header card */}
      <div className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] overflow-hidden">
        <div className="p-6 flex items-center gap-4 border-b border-[var(--border-light)]">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--bg-light)] flex items-center justify-center shrink-0">
            {parent?.avatarUrl
              ? <img src={parent.avatarUrl} alt={parent?.fullName} className="w-full h-full object-cover" />
              : <User size={28} className="text-[var(--primary)]" />}
          </div>
          <div className="min-w-0">
            {loading
              ? <div className="h-5 w-32 bg-[var(--bg-section)] rounded animate-pulse mb-1" />
              : <h2 className="text-lg font-bold text-[var(--text-dark)] truncate">{parent?.fullName || '—'}</h2>}
            {parent?.email && <p className="text-sm text-[var(--text-light)] truncate">{parent.email}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1 px-6 overflow-x-auto">
          <TabButton label="حسابي" isActive={activeTab === 'parent'} onClick={() => setActiveTab('parent')} />
          {students.map((s) => (
            <TabButton key={s.id} label={s.user?.fullName || 'بدون اسم'} isActive={activeTab === s.id} onClick={() => setActiveTab(s.id)} />
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-[var(--text-light)]">
          <Loader2 size={24} className="animate-spin ml-2" />
          جاري تحميل البيانات...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4">{error}</div>
      )}

      {/* Parent tab */}
      {!loading && !error && activeTab === 'parent' && parent && (
        <>
          <SectionCard
            title="البيانات الشخصية"
            subtitle="بياناتك الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
            onEditClick={() => handleNavigateToEdit?.('parent', 'personal')}
          >
            <DataRow label="الاسم الكامل" value={orDash(parent.fullName)} />
            <DataRow label="اسم المستخدم" value={orDash(parent.username)} />
            <DataRow label="البريد الإلكتروني" value={orDash(parent.email)} />
            <DataRow label="رقم الهاتف" value={orDash(parent.phone)} />
          </SectionCard>

          <SectionCard
            title="الأمان وكلمة المرور"
            subtitle="تغيير كلمة المرور وإعدادات الأمان"
            editLabel="تغيير كلمة المرور"
            onEditClick={() => handleNavigateToEdit?.('parent', 'security')}
          >
            <div className="sm:col-span-2">
              <DataRow label="كلمة المرور" value="••••••••" />
              <p className="text-xs text-[var(--text-light)] mt-1">آخر تغيير منذ 3 أشهر</p>
            </div>
          </SectionCard>
        </>
      )}

      {/* Child tab */}
      {!loading && !error && activeStudent && (() => {
        const u = activeStudent.user ?? {};
        const s = activeStudent;
        return (
          <>
            <SectionCard
              title="البيانات الشخصية"
              subtitle="بيانات الطالب الأساسية التي تُستخدم في جميع الخدمات الرسمية داخل المنصة."
              onEditClick={() => handleNavigateToEdit?.(s.id, 'personal')}
            >
              <DataRow label="الاسم الكامل" value={orDash(u.fullName)} />
              <DataRow label="اسم المستخدم" value={orDash(s.username || u.username)} />
              <DataRow label="تاريخ الميلاد" value={orDash(s.birthDate || u.birthDate)} />
              <DataRow label="الدولة" value={orDash(s.countryCode || u.countryCode)} />
              <DataRow label="رقم الهاتف" value={orDash(s.phone || u.phone)} />
            </SectionCard>

            <SectionCard
              title="البيانات الأكاديمية"
              subtitle="البيانات التعليمية الأساسية التي تُستخدم لإدارة الرحلة التعليمية داخل المنصة."
              onEditClick={() => handleNavigateToEdit
                ?.(s.id, 'academic')}
            >
              <DataRow label="المرحلة الدراسية" value={readableName(s.stage)} />
              <DataRow label="الصف الدراسي" value={readableName(s.grade)} />
              <DataRow label="المنهج الدراسي" value={readableName(s.curriculum)} />
              <DataRow label="لغة التعلم المفضلة" value={langLabel(s.studyLanguage)} />
            </SectionCard>

            <SectionCard
              title="الأمان وكلمة المرور"
              subtitle="تغيير كلمة المرور وإعدادات الأمان"
              editLabel="تغيير كلمة المرور"
              onEditClick={() => handleNavigateToEdit?.(s.id, 'security')}
            >
              <div className="sm:col-span-2">
                <DataRow label="كلمة المرور" value="••••••••" />
                <p className="text-xs text-[var(--text-light)] mt-1">آخر تغيير منذ 3 أشهر</p>
              </div>
            </SectionCard>
          </>
        );
      })()}
    </div>
  );
};

export default AccountView;