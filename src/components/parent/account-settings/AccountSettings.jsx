import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from 'react-hot-toast';

import { User, Camera, Loader2 } from 'lucide-react';
import {
    getMyProfile,
    getMyStudents,
    updateMyProfile,
    updateStudent,
    getCountries,
    getCurriculums,
} from '../../../services/authService';
import { AuthContext } from '../../../context/AuthContext';
import {
    ParentProfileCard,
    StudentPersonalCard,
    StudentAcademicCard,
    SecurityCard,
} from './ProfileCards';

const getFlagUrl = (code) => (code ? `https://flagcdn.com/w40/${code.toLowerCase()}.png` : null);

// Same normalization shape used during registration, so the country list
// behaves identically here (id / code / name / phoneCode / flagUrl).
function normalizeCountries(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data || [];
    return list.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name || 'Unknown',
        flagUrl: getFlagUrl(c.code),
        phoneCode: c.phoneCode || '',
    }));
}

function normalizeCurriculums(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data || [];
    return list.map((c) => ({
        id: c.id,
        name: typeof c.name === 'string' ? c.name : c.name?.ar || c.name?.en || '',
    }));
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/* ── Tab button ── */
const TabButton = ({ label, isActive, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-light)] hover:text-[var(--text-dark)]'
            }`}
    >
        {label}
        {isActive && <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-[var(--primary)] rounded-full" />}
    </button>
);

/**
 * AccountSettings
 *
 * Layout matches the design screenshots:
 *   - Header card: avatar + name/email + tabs (حسابي | one per child)
 *   - Below: cards for personal / academic / security data
 *   - Every card has its own pencil → live edit mode, matching the
 *     edit-mode screenshots (single-column inputs/dropdowns, locked phone
 *     field with dial-code chip, password rules checklist).
 *
 * Country / curriculum lookups are the exact same endpoints used on the
 * register screen (getCountries, getCurriculums, getCurriculumStages,
 * getStageGrades), so a child's stage/grade/curriculum/country edit
 * dropdowns are wired to real data, with the curriculum → stage → grade
 * cascade handled inside StudentAcademicCard.
 */
const AccountSettings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const id = searchParams.get("id");
    const section = searchParams.get("section");

    const { logout } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    const [parent, setParent] = useState(null);
    const [students, setStudents] = useState([]);
    const [activeTab, setActiveTab] = useState('parent');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [countries, setCountries] = useState([]);
    const [loadingCountries, setLoadingCountries] = useState(true);
    const [curriculums, setCurriculums] = useState([]);
    const [loadingCurriculums, setLoadingCurriculums] = useState(true);

    /* ── load ── */
    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [profileRes, studentsRes] = await Promise.all([getMyProfile(), getMyStudents()]);

            // GET /users/me → merge outer fields + user node
            const outerData = profileRes?.data?.data ?? {};
            const userNode = outerData.user ?? {};
            setParent({ ...outerData, ...userNode });

            // GET /parents/students → data is a direct array
            const raw = studentsRes?.data?.data;
            setStudents(Array.isArray(raw) ? raw : []);
        } catch {
            setError('حدث خطأ أثناء تحميل بيانات الحساب، حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Country + curriculum lookups, fetched once — same endpoints as the
    // registration flow — and shared across every child tab.
    useEffect(() => {
        getCountries()
            .then((res) => setCountries(normalizeCountries(res.data)))
            .catch(() => setCountries([]))
            .finally(() => setLoadingCountries(false));

        getCurriculums()
            .then((res) => setCurriculums(normalizeCurriculums(res.data)))
            .catch(() => setCurriculums([]))
            .finally(() => setLoadingCurriculums(false));
    }, []);

    /* ── after-save logic ── */
    const afterSave = async (changedSensitive) => {
        if (changedSensitive) {
            toast.success('تم تحديث بياناتك بنجاح، يرجى تسجيل الدخول مرة أخرى.');
            setTimeout(() => { logout(); navigate('/login'); }, 2000);
            return;
        }
        toast.success('تم حفظ التعديلات بنجاح');
        await loadData();
    };

    /* ── save handlers ── */
    const handleSaveParentInfo = async (payload, sens) => { await updateMyProfile(payload); await afterSave(sens); };
    const handleSaveParentSecurity = async (payload) => { await updateMyProfile(payload); await afterSave(true); };
    const handleSaveStudentInfo = async (payload, sens) => { await updateStudent(activeStudent.id, payload); await afterSave(sens); };
    const handleSaveStudentAcademic = async (payload) => { await updateStudent(activeStudent.id, payload); await afterSave(false); };
    const handleSaveStudentSecurity = async (payload) => { await updateStudent(activeStudent.id, payload); await afterSave(true); };

    /* ── avatar ── */
    const handleAvatarClick = () => fileInputRef.current?.click();
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        try {
            const base64 = await fileToBase64(file);
            await updateMyProfile({ avatarUrl: base64 });
            toast.success('تم تحديث الصورة بنجاح');
            loadData();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
        } finally {
            setUploadingAvatar(false);
            e.target.value = '';
        }
    };

    const activeStudent = activeTab !== 'parent' ? students.find((s) => s.id === activeTab) : null;

    useEffect(() => {
        if (!loading && id) {
            if (id === "parent") {
                setActiveTab("parent");
            } else {
                setActiveTab(id);
            }
        }
    }, [loading, id]);
    /* ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="space-y-5" dir="rtl">

            {/* ── Header card ── */}
            <div className="bg-[var(--white)] border border-[var(--border-light)] rounded-2xl shadow-[var(--shadow)] overflow-hidden">

                {/* Avatar + name */}
                <div className="p-6 flex items-center gap-4 border-b border-[var(--border-light)]">
                    <div className="relative w-16 h-16 shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-[var(--bg-light)] flex items-center justify-center">
                            {parent?.avatarUrl ? (
                                <img src={parent.avatarUrl} alt={parent?.fullName} className="w-full h-full object-cover" />
                            ) : (
                                <User size={28} className="text-[var(--primary)]" />
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            disabled={uploadingAvatar}
                            className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center border-2 border-white disabled:opacity-60"
                            aria-label="تغيير الصورة"
                        >
                            {uploadingAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>

                    <div className="min-w-0">
                        {loading ? (
                            <div className="h-5 w-32 bg-[var(--bg-section)] rounded animate-pulse mb-1" />
                        ) : (
                            <h2 className="text-lg font-bold text-[var(--text-dark)] truncate">{parent?.fullName || '—'}</h2>
                        )}
                        {parent?.email && <p className="text-sm text-[var(--text-light)] truncate">{parent.email}</p>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 px-6 overflow-x-auto">
                    <TabButton label="حسابي" isActive={activeTab === 'parent'} onClick={() => setActiveTab('parent')} />
                    {students.map((s) => (
                        <TabButton
                            key={s.id}
                            label={s.user?.fullName || 'بدون اسم'}
                            isActive={activeTab === s.id}
                            onClick={() => setActiveTab(s.id)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex items-center justify-center py-16 text-[var(--text-light)]">
                    <Loader2 size={22} className="animate-spin ml-2" />
                    جاري تحميل البيانات...
                </div>
            )}

            {/* ── Error ── */}
            {!loading && error && (
                <div className="text-center text-red-500 bg-red-50 border border-red-100 rounded-xl py-6 px-4">{error}</div>
            )}

            {/* ── Parent tab ── */}
            {!loading && !error && activeTab === 'parent' && parent && (
                <>
                    <ParentProfileCard parent={parent} onSave={handleSaveParentInfo} />
                    <SecurityCard onSave={handleSaveParentSecurity} />
                </>
            )}

            {/* ── Child tab ── */}
            {!loading && !error && activeStudent && (
                <>
                    <StudentPersonalCard
                        student={activeStudent}
                        countries={countries}
                        loadingCountries={loadingCountries}
                        onSave={handleSaveStudentInfo}
                    />
                    <StudentAcademicCard
                        student={activeStudent}
                        curriculums={curriculums}
                        loadingCurriculums={loadingCurriculums}
                        onSave={handleSaveStudentAcademic}
                    />
                    <SecurityCard onSave={handleSaveStudentSecurity} />
                </>
            )}
        </div>
    );
};

export default AccountSettings;