import { db } from "hatchable";
import { schoolContext,canManage } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){const {rows}=await db.query("SELECT id,title,body,audience,created_at FROM announcements WHERE school_id=$1 ORDER BY created_at DESC LIMIT 100",[sid]);return res.json({announcements:rows});}
 if(!canManage(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};if(!b.title||!b.body)return res.status(400).json({error:"Title and message are required."});
 const {rows}=await db.query("INSERT INTO announcements(school_id,title,body,audience) VALUES($1,$2,$3,$4) RETURNING *",[sid,b.title,b.body,b.audience||"all"]);
 res.status(201).json({announcement:rows[0]});
}