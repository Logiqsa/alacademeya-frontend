import React from 'react';
import ParentLayout from '../../components/parent/layout/ParentLayout';
import { useNavigate } from "react-router-dom";
import { Plus } from 'lucide-react';
import ChildrenStatsCards from '../../components/parent/children/ChildrenStatsCard';
import ChildrenSearch from '../../components/parent/children/ChildrenSearch';
import ChildrenTable from '../../components/parent/children/ChildrenTable';


const ChildrenPage = () => {
    const navigate = useNavigate();
    return (

        <ParentLayout >
            <div className="w-full p-2 font-['IBM_Plex_Sans_Arabic'] text-right" dir="rtl">
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

                <div className="bg-white border mb-8 border-[#E5E5E5] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.12)] rounded-2xl p-5 w-full items-center">
                    <ChildrenSearch />
                </div>


                <div >
                    <ChildrenTable />
                </div>
            </div>

        </ParentLayout>
    );
};

export default ChildrenPage;