import { useState } from 'react';
import StepsNavigation from '../../../components/parent/add-child/StepsNavigation';
import PersonalInfoStep from '../../../components/parent/add-child/PersonalInfoStep';
import AcademicInfoStep from '../../../components/parent/add-child/AcademicInfoStep';
import AccountSetupStep from '../../../components/parent/add-child/AccountSetupStep';
import SubscriptionStep from '../../../components/parent/add-child/SubscriptionStep';
import ParentLayout from '../../../components/parent/layout/ParentLayout';
import SuccessStep from '../../../components/parent/add-child/SuccessStep';
import RequestStatusPage from '../../../components/parent/add-child/RequestStatusPage';

const AddChildPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  if (showStatus) {
    return (
      <ParentLayout>
        <div className="max-w-4xl mx-auto mt-10">
          <RequestStatusPage />
        </div>
      </ParentLayout>
    );
  }

  if (isSubmitted) {
    return (
      <ParentLayout>
        <div className="max-w-4xl mx-auto mt-20">
          <SuccessStep onStatusClick={() => setShowStatus(true)} />
        </div>
      </ParentLayout>
    );
  }

  const stepTitles = {
    1: "المعلومات الشخصية",
    2: "المعلومات الأكاديمية",
    3: "بيانات دخول الطالب",
    4: "الاشتراك والدفع"
  };

  return (
    <ParentLayout>
      <div className="max-w-7xl mx-auto p-6 font-['IBM_Plex_Sans_Arabic']">
        <div className="text-right mb-8">
          <h1 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[24px] leading-8 text-[#123C91]">
            إضافة ابن جديد
          </h1>
          <p className="font-['IBM_Plex_Sans_Arabic'] font-normal text-[16px] leading-6 text-[#575F69] mt-3">
            الخطوة {currentStep} من 4 - {stepTitles[currentStep]}
          </p>
        </div>

        <StepsNavigation currentStep={currentStep} />

        <div className="mt-8 bg-white p-8 rounded-2xl border border-[#1F293726] shadow-sm">
          {currentStep === 1 && (
            <PersonalInfoStep onNext={() => setCurrentStep(2)} />
          )}
          {currentStep === 2 && (
            <AcademicInfoStep onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />
          )}
          {currentStep === 3 && (
            <AccountSetupStep onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />
          )}
          {currentStep === 4 && (
            <SubscriptionStep
              onNext={() => setIsSubmitted(true)}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </div>
    </ParentLayout>
  );
};

export default AddChildPage;