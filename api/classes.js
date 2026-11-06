import { db } from "hatchable";
import { schoolContext,canManage } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){const {rows}=await db.query("SELECT c.id,c.name,c.arm,c.capacity,count(s.id)::int AS student_count FROM classes c LEFT JOIN students s ON s.class_id=c.id AND s.status='active' WHERE c.school_id=$1 GROUP BY c.id ORDER BY c.name,c.arm",[sid]);return res.json({classes:rows});}
 if(!canManage(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};if(!b.name)return res.status(400).json({error:"Class name is required."});
 const {rows}=await db.query("INSERT INTO classes(school_id,name,arm,capacity) VALUES($1,$2,$3,$4) RETURNING *",[sid,b.name,b.arm||"A",Number(b.capacity)||40]);
 res.status(201).json({class:rows[0]});
}