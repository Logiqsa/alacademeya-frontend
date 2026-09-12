import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import AdminLayout from "../../../components/admin/layout/AdminLayout";
import Breadcrumbs from "../../shared/Breadcrumbs";
import { createSubscription, getAdminStudentSubscriptionOptions, getAllStudents, getAvailableClassrooms } from "../../../services/APIService";
import { adminApiErrorMessage, apiList, buildManualSubscriptionPayload, idOf, nameOf } from "../../../utils/adminSubscription";

const cls="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-[#123C91] disabled:bg-gray-50";
const blank={subject:"",package:"",teacher:"",classroom:"",type:"group",discount:0};
const Field=({label,children})=><label className="block text-sm text-gray-700"><span className="mb-1.5 block font-medium">{label}</span>{children}</label>;
const linkedTo=(list,subject)=>list.filter(x=>{const ids=[x.subject,...(x.subjects||[])].map(idOf).filter(Boolean);return !ids.length||ids.includes(subject)});

export default function AddSubscriptionPage(){
 const nav=useNavigate(),[query]=useSearchParams();
 const [students,setStudents]=useState([]),[student,setStudent]=useState(query.get("studentId")||"");
 const [options,setOptions]=useState(null),[item,setItem]=useState(blank),[rooms,setRooms]=useState([]),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 useEffect(()=>{getAllStudents({page:1,limit:1000}).then(r=>setStudents(apiList(r,["students","results","items"]))).catch(()=>toast.error("تعذر تحميل الطلاب"))},[]);
 useEffect(()=>{if(student)getAdminStudentSubscriptionOptions(student).then(r=>setOptions(r.data?.data||r.data)).catch(e=>toast.error(adminApiErrorMessage(e,"تعذر تحميل خيارات الاشتراك")))},[student]);
 useEffect(()=>{if(item.subject&&item.teacher&&item.type)getAvailableClassrooms({subject:item.subject,teacher:item.teacher,type:item.type}).then(r=>setRooms(apiList(r,["classrooms","results","items"]).filter(c=>!c.status||c.status==="active"))).catch(()=>toast.error("تعذر تحميل المجموعات"))},[item.subject,item.teacher,item.type]);
 const subjects=apiList(options,["subjects","availableSubjects"]),teachers=apiList(options,["teachers","availableTeachers"]),packages=apiList(options,["packages","availablePackages"]);
 const set=(key,value)=>{if(["subject","teacher","type"].includes(key))setRooms([]);setItem(x=>({...x,[key]:value,...(key==="subject"?{teacher:"",package:"",classroom:""}:(["teacher","type"].includes(key)?{classroom:""}:{}))}))};
 const submit=async e=>{e.preventDefault();if(!student||["subject","package","teacher","classroom","type"].some(k=>!item[k]))return toast.error("يرجى استكمال جميع الحقول المطلوبة");setBusy(true);try{await createSubscription(buildManualSubscriptionPayload(student,[item]));setDone(true);toast.success("تم إنشاء الاشتراك وتفعيله بنجاح")}catch(err){toast.error(adminApiErrorMessage(err,"تعذر إنشاء الاشتراك"))}finally{setBusy(false)}};
 if(done){const summary=[["الطالب",nameOf(students.find(x=>idOf(x)===student)?.user)||nameOf(students.find(x=>idOf(x)===student))],["المادة",nameOf(subjects.find(x=>idOf(x)===item.subject))],["الباقة",nameOf(packages.find(x=>idOf(x)===item.package))],["المعلم",nameOf(teachers.find(x=>idOf(x)===item.teacher))],["المجموعة",nameOf(rooms.find(x=>idOf(x)===item.classroom))],["النوع",item.type==="private"?"فردي":"مجموعة"],["الجلسات",packages.find(x=>idOf(x)===item.package)?.sessions||"—"],["الحالة","نشط"]];return <AdminLayout><Breadcrumbs homeTo="/admin-dashboard"/><main dir="rtl" className="p-6"><section className="mx-auto max-w-xl rounded-2xl border border-green-200 bg-white p-8"><h1 className="text-xl font-bold text-green-700">تم إنشاء الاشتراك بنجاح</h1><div className="mt-5 grid gap-2 sm:grid-cols-2">{summary.map(([k,v])=><DetailSummary key={k} label={k} value={v}/>)}</div><button onClick={()=>nav("/admin/subscription")} className="mt-6 rounded-xl bg-[#123C91] px-5 py-2.5 text-white">عرض الاشتراكات</button></section></main></AdminLayout>}
 return <AdminLayout><Breadcrumbs homeTo="/admin-dashboard"/><main dir="rtl" className="p-3 sm:p-6 font-['IBM_Plex_Sans_Arabic']"><h1 className="text-xl font-semibold text-[#123C91]">إنشاء اشتراك يدوي</h1><p className="mt-1 text-sm text-gray-600">سيصبح الاشتراك نشطًا فور إنشائه.</p><form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border bg-white p-5 sm:grid-cols-2">
 <Field label="الطالب *"><select className={cls} value={student} onChange={e=>{setStudent(e.target.value);setOptions(null);setItem(blank);setRooms([])}}><option value="">اختر الطالب</option>{students.map(x=><option key={idOf(x)} value={idOf(x)}>{nameOf(x.user)||nameOf(x)}</option>)}</select></Field>
 <Field label="المادة *"><select className={cls} disabled={!options} value={item.subject} onChange={e=>set("subject",e.target.value)}><option value="">اختر المادة</option>{subjects.map(x=><option key={idOf(x)} value={idOf(x)}>{nameOf(x)}</option>)}</select></Field>
 <Field label="النوع *"><select className={cls} value={item.type} onChange={e=>set("type",e.target.value)}><option value="group">مجموعة</option><option value="private">فردي</option></select></Field>
 <Field label="المعلم *"><select className={cls} disabled={!item.subject} value={item.teacher} onChange={e=>set("teacher",e.target.value)}><option value="">اختر المعلم</option>{linkedTo(teachers,item.subject).map(x=><option key={idOf(x)} value={idOf(x)}>{nameOf(x)}</option>)}</select></Field>
 <Field label="الباقة *"><select className={cls} disabled={!item.subject} value={item.package} onChange={e=>set("package",e.target.value)}><option value="">اختر الباقة</option>{linkedTo(packages,item.subject).map(x=><option key={idOf(x)} value={idOf(x)}>{nameOf(x)}</option>)}</select></Field>
 <Field label="المجموعة *"><select className={cls} disabled={!item.teacher} value={item.classroom} onChange={e=>set("classroom",e.target.value)}><option value="">اختر المجموعة</option>{rooms.map(x=><option key={idOf(x)} value={idOf(x)}>{nameOf(x)}</option>)}</select></Field>
 <Field label="الخصم"><input className={cls} type="number" min="0" value={item.discount} onChange={e=>set("discount",e.target.value)}/></Field><div className="flex items-end gap-3"><button disabled={busy} className="h-11 rounded-xl bg-[#123C91] px-6 text-white disabled:opacity-50">{busy?"جاري الإنشاء...":"إنشاء الاشتراك"}</button><button type="button" onClick={()=>nav(-1)} className="h-11 rounded-xl border px-5">إلغاء</button></div>
 </form></main></AdminLayout>
}

const DetailSummary=({label,value})=><div className="rounded-xl bg-gray-50 p-3"><span className="block text-xs text-gray-500">{label}</span><b className="mt-1 block text-sm">{value||"—"}</b></div>;
