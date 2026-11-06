import { db } from "hatchable";
import { schoolContext,canManage } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){const {rows}=await db.query("SELECT s.id,s.name,s.code,c.name AS class_name,t.full_name AS teacher_name FROM subjects s LEFT JOIN classes c ON c.id=s.class_id LEFT JOIN staff t ON t.id=s.teacher_id WHERE s.school_id=$1 ORDER BY s.name",[sid]);return res.json({subjects:rows});}
 if(!canManage(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};if(!b.name)return res.status(400).json({error:"Subject name is required."});
 const {rows}=await db.query("INSERT INTO subjects(school_id,name,code,class_id,teacher_id) VALUES($1,$2,$3,$4,$5) RETURNING *",[sid,b.name,b.code||null,b.class_id||null,b.teacher_id||null]);
 res.status(201).json({subject:rows[0]});
}