import React from 'react';
import ParentLayout from '../../components/parent/layout/ParentLayout';
import { useNavigate } from "react-router-dom";
import { Plus } from 'lucide-react';
import ChildrenStatsCards from '../../components/parent/children/ChildrenStatsCard';


const ChildrenPage = () => {
    const navigate = useNavigate();
    return (

        <ParentLayout >
            <div className="w-full px-6 py-4 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
                <div className="flex items-center justify-between mb-4">

                    <div>
                        <h1 className="text-[24px] font-semibold leading-8 text-[#123C91] mb-3">
                            إدارة الأبناء
                        </h1>
                        <p className="text-[16px] font-normal leading-6 text-[#575F69]">
                            إدارة ومتابعة بيانات وأداء أبنائك
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/parent-dashboard/add-child")}
                        className="flex items-center justify-center bg-[#123C91] text-white text-sm rounded-lg  w-40 h-3 py-3 px-6 gap-2"
                        style={{
                            height: '48px',
                        }}
                    >
                        <Plus size={20} />
                        <span>إضافة ابن</span>
                    </button>
                </div>


                <div className="w-full mb-8">
                    <ChildrenStatsCards />
                </div>


                {/* <input 
        type="text" 
        placeholder="بحث عن ابن..." 
        className="w-full p-4 mb-6 rounded-lg border border-[#E5E5E5] outline-none"
      /> */}


                {/* <div className="w-[1136px] bg-white border border-[#E5E5E5] rounded-[8px] shadow-sm">
        <ChildrenTable />
      </div> */}
            </div>

        </ParentLayout>
    );
};

export default ChildrenPage;