// // src/pages/parent/add-child/AddChildPage.jsx
// import { useState } from 'react';
// import StepsNavigation from '../../../components/parent/add-child/StepsNavigation';
// import PersonalInfoStep from '../../../components/parent/add-child/PersonalInfoStep';
// import AcademicInfoStep from '../../../components/parent/add-child/AcademicInfoStep';
// import AccountSetupStep from '../../../components/parent/add-child/AccountSetupStep';
// import SuccessStep from '../../../components/parent/add-child/SuccessStep';
// import ParentLayout from '../../../components/parent/layout/ParentLayout';
// // استيراد المكونات من مجلد components/parent/add-child/


// const AddChildPage = () => {
//   const [currentStep, setCurrentStep] = useState(1);

//   return (
//     <ParentLayout>
//       <div className="max-w-5xl mx-auto p-6 font-['IBM_Plex_Sans_Arabic']">
//         <h1 className="text-2xl font-bold mb-8 text-[#123C91] text-right">إضافة ابن جديد</h1>
        
//         {/* شريط الخطوات الأفقي */}
//         <StepsNavigation currentStep={currentStep} />

//         <div className="mt-8 bg-white p-8 rounded-[16px] border border-[#1F293726] shadow-sm">
//           {currentStep === 1 && <PersonalInfoStep onNext={() => setCurrentStep(2)} />}
//           {currentStep === 2 && <AcademicInfoStep onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
//           {currentStep === 3 && <AccountSetupStep onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />}
//           {currentStep === 4 && <SuccessStep />}
//         </div>
//       </div>
//     </ParentLayout>
//   );
// };
// export default AddChildPage;