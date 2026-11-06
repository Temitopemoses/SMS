import { db } from "hatchable";
import { schoolContext } from "lib/school.js";
export const access="user"; export const methods=["GET","POST"];
export default async function(req,res){
 const c=await schoolContext(req.user),sid=c.school_id;
 if(req.method==="GET"){
  const [invoices,payments]=await Promise.all([db.query("SELECT f.id,f.title,f.amount,f.paid_amount,f.due_date,f.status,s.admission_no,s.first_name,s.last_name FROM fee_invoices f JOIN students s ON s.id=f.student_id WHERE f.school_id=$1 ORDER BY f.created_at DESC LIMIT 200",[sid]),db.query("SELECT id,student_id,amount,method,reference,paid_at FROM payments WHERE school_id=$1 ORDER BY paid_at DESC LIMIT 100",[sid])]);
  return res.json({invoices:invoices.rows,payments:payments.rows});
 }
 if(!["school_admin","accountant","super_admin"].includes(c.role))return res.status(403).json({error:"Not permitted."});
 const b=req.body||{};
 if(b.type!=="invoice")return res.status(400).json({error:"Only invoice creation is enabled here. Payment processing needs a verified gateway integration."});
 if(!b.student_id||!b.title||!(Number(b.amount)>0))return res.status(400).json({error:"Student, fee title and positive amount are required."});
 const {rows}=await db.query("INSERT INTO fee_invoices(school_id,student_id,title,amount,due_date) SELECT $1,id,$3,$4,$5 FROM students WHERE id=$2 AND school_id=$1 RETURNING *",[sid,b.student_id,b.title,Number(b.amount),b.due_date||null]);
 if(!rows.length)return res.status(404).json({error:"Student not found."});
 res.status(201).json({invoice:rows[0]});
}