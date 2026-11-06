import { db } from "hatchable";
export async function schoolContext(user) {
 const found=await db.query("SELECT p.user_id,p.school_id,p.full_name,p.role,s.name AS school_name FROM user_profiles p JOIN schools s ON s.id=p.school_id WHERE p.user_id=$1",[user.id]);
 if(found.rows.length)return found.rows[0];
 const count=await db.query("SELECT count(*)::int AS n FROM schools");
 let schoolId;
 if(Number(count.rows[0].n)===0){
  const created=await db.query("INSERT INTO schools(name,code) VALUES($1,$2) RETURNING id,name",["My School","SCH-"+Date.now().toString().slice(-6)]);
  schoolId=created.rows[0].id;
  await db.query("INSERT INTO user_profiles(user_id,full_name,role,school_id) VALUES($1,$2,'school_admin',$3)",[user.id,user.name||user.email.split("@")[0],schoolId]);
 } else {
  const first=await db.query("SELECT id,name FROM schools ORDER BY created_at LIMIT 1");
  schoolId=first.rows[0].id;
  await db.query("INSERT INTO user_profiles(user_id,full_name,role,school_id) VALUES($1,$2,'parent',$3) ON CONFLICT(user_id) DO NOTHING",[user.id,user.name||user.email.split("@")[0],schoolId]);
 }
 const again=await db.query("SELECT p.user_id,p.school_id,p.full_name,p.role,s.name AS school_name FROM user_profiles p JOIN schools s ON s.id=p.school_id WHERE p.user_id=$1",[user.id]);
 return again.rows[0];
}
export function canManage(role){return ["super_admin","school_admin","principal"].includes(role);}