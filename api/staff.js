import { db } from "hatchable";
import { schoolContext,canManage } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){const {rows}=await db.query("SELECT id,full_name,email,phone,role,department,status FROM staff WHERE school_id=$1 ORDER BY created_at DESC",[sid]);return res.json({staff:rows});}
 if(!canManage(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};if(!b.full_name)return res.status(400).json({error:"Staff name is required."});
 const {rows}=await db.query("INSERT INTO staff(school_id,full_name,email,phone,role,department) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",[sid,b.full_name,b.email||null,b.phone||null,b.role||"teacher",b.department||null]);
 res.status(201).json({staff:rows[0]});
}