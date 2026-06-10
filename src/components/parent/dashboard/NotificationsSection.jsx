import bellIcon from "../../../assets/icons/bell-icon.svg"; 
import bellEmpty from "../../../assets/bell-empty.svg"; 

const NotificationsSection = () => {
  return (
    <div 
      className="bg-white border border-[#1F293726] rounded-2xl p-8 flex flex-col"

    >
      <div className="flex items-center justify-start gap-2">
        <img src={bellIcon} alt="bell" className="w-6 h-6" />
        <h3 className="font-['IBM_Plex_Sans_Arabic'] font-semibold text-[20px] leading-6 text-[#123C91]">
          الإشعارات
        </h3>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div 
          className="mb-4 flex items-center justify-center  rounded-full"
         
        >
          <img src={bellEmpty} alt="no-notifications" className="w-20 h-20 opacity-80" />
        </div>

        <p 
          className="font-['IBM_Plex_Sans_Arabic'] text-center mb-2"
          style={{ 
            fontWeight: 500, 
            fontSize: '20px', 
            lineHeight: '32px', 
            color: '#1F2937' 
          }}
        >
          لا توجد إشعارات حالياً
        </p>

        <p 
          className="font-['IBM_Plex_Sans_Arabic'] text-center "
          style={{ 
            fontWeight: 400, 
            fontSize: '16px', 
            lineHeight: '24px', 
            color: '#1F2937BF' 
          }}
        >
          ستظهر هنا الإشعارات الخاصة بأبنائك.
        </p>
      </div>
    </div>
  );
};

export default NotificationsSection;