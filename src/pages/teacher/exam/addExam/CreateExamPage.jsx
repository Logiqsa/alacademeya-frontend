import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherLayout from '../../../components/teacher/layout/TeacherLayout';
import ExamBasicInfoStep from '../../../../components/teacher/exam/addExam/ExamBasicInfoStep';
import ExamQuestionsStep from '../../../../components/teacher/exam/addExam/ExamQuestionsStep';
import ExamReviewStep from '../../../../components/teacher/exam/addExam/ExamReviewStep';


const stepTitles = {
  1: 'المعلومات الأساسية',
  2: 'الأسئلة',
  3: 'مراجعة وإنشاء',
};

const CreateExamPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    passingScore: '',
    group: '',
    lesson: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    shuffle: false,
    notifyOnPublish: false,
    notifyReminder: false,
    questions: [],
  });

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <TeacherLayout>
      <div className="max-w-3xl mx-auto px-2 sm:px-4 py-4 sm:py-6 font-['IBM_Plex_Sans_Arabic']" dir="rtl">
        {/* Header */}
        <div className="text-right mb-4">
          <h1 className="font-semibold text-[22px] sm:text-[26px] text-[#123C91]">إنشاء اختبار جديد</h1>
          <p className="text-[14px] sm:text-[16px] text-[#575F69] mt-1">
            الخطوة {currentStep} من 3 - {stepTitles[currentStep]}
          </p>
        </div>

        <ExamStepsNavigation currentStep={currentStep} />

        <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-2xl border border-[#E5E7EB] shadow-sm">
          {currentStep === 1 && (
            <ExamBasicInfoStep
              data={formData}
              onChange={handleChange}
              onNext={() => setCurrentStep(2)}
              onCancel={() => navigate('/teacher/exams')}
            />
          )}
          {currentStep === 2 && (
            <ExamQuestionsStep
              data={formData}
              onChange={handleChange}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <ExamReviewStep
              data={formData}
              onBack={() => setCurrentStep(2)}
              onSuccess={() => navigate('/teacher/exams')}
            />
          )}
        </div>
      </div>
    </TeacherLayout>
  );
};

export default CreateExamPage;