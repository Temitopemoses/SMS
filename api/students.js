import { db } from "hatchable";
import { schoolContext,canManage } from "lib/school.js";
export const access="user";
export const methods=["GET","POST","PUT","DELETE"];
export default async function(req,res){
 const ctx=await schoolContext(req.user),sid=ctx.school_id;
 if(req.method==="GET"){
  const q=(req.query.q||"").trim();
  const {rows}=await db.query("SELECT s.id,s.admission_no,s.first_name,s.last_name,s.gender,s.phone,s.parent_name,s.parent_phone,s.status,c.name AS class_name,c.arm FROM students s LEFT JOIN classes c ON c.id=s.class_id WHERE s.school_id=$1 AND ($2='' OR s.first_name ILIKE '%'||$2||'%' OR s.last_name ILIKE '%'||$2||'%' OR s.admission_no ILIKE '%'||$2||'%') ORDER BY s.created_at DESC LIMIT 250",[sid,q]);
  return res.json({students:rows});
 }
 if(!canManage(ctx.role))return res.status(403).json({error:"You do not have permission to manage students."});
 const b=req.body||{};
 if(req.method==="POST"){
  if(!b.admission_no||!b.first_name||!b.last_name)return res.status(400).json({error:"Admission number, first name and last name are required."});
  const {rows}=await db.query("INSERT INTO students(school_id,admission_no,first_name,last_name,gender,date_of_birth,email,phone,parent_name,parent_phone,address,class_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *",[sid,b.admission_no,b.first_name,b.last_name,b.gender||null,b.date_of_birth||null,b.email||null,b.phone||null,b.parent_name||null,b.parent_phone||null,b.address||null,b.class_id||null]);
  return res.status(201).json({student:rows[0]});
 }
 if(!b.id)return res.status(400).json({error:"Student id is required."});
 if(req.method==="PUT"){
  const {rows}=await db.query("UPDATE students SET admission_no=$3,first_name=$4,last_name=$5,gender=$6,phone=$7,parent_name=$8,parent_phone=$9,class_id=$10,status=$11 WHERE id=$1 AND school_id=$2 RETURNING *",[b.id,sid,b.admission_no,b.first_name,b.last_name,b.gender||null,b.phone||null,b.parent_name||null,b.parent_phone||null,b.class_id||null,b.status||"active"]);
  if(!rows.length)return res.status(404).json({error:"Student not found."});
  return res.json({student:rows[0]});
 }
 const {rows}=await db.query("UPDATE students SET status='inactive' WHERE id=$1 AND school_id=$2 RETURNING id",[b.id,sid]);
 if(!rows.length)return res.status(404).json({error:"Student not found."});
 res.json({ok:true});
}