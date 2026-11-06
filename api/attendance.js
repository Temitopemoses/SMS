import { db } from "hatchable";
import { schoolContext } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){
  const date=req.query.date||new Date().toISOString().slice(0,10);
  const {rows}=await db.query("SELECT a.id,a.student_id,a.attendance_date,a.status,s.admission_no,s.first_name,s.last_name,c.name AS class_name FROM attendance a JOIN students s ON s.id=a.student_id LEFT JOIN classes c ON c.id=a.class_id WHERE a.school_id=$1 AND a.attendance_date=$2 ORDER BY s.last_name,s.first_name",[sid,date]);
  return res.json({attendance:rows});
 }
 if(!["school_admin","principal","teacher","super_admin"].includes(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};if(!b.student_id||!["present","absent","late","excused"].includes(b.status))return res.status(400).json({error:"Student and valid attendance status are required."});
 const {rows}=await db.query("INSERT INTO attendance(school_id,student_id,class_id,attendance_date,status,note) SELECT $1,s.id,s.class_id,COALESCE($3::date,CURRENT_DATE),$4,$5 FROM students s WHERE s.id=$2 AND s.school_id=$1 ON CONFLICT(student_id,attendance_date) DO UPDATE SET status=EXCLUDED.status,note=EXCLUDED.note RETURNING *",[sid,b.student_id,b.date||null,b.status,b.note||null]);
 if(!rows.length)return res.status(404).json({error:"Student not found."});
 res.json({record:rows[0]});
}