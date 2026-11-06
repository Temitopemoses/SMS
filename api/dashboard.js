import { db } from "hatchable";
import { schoolContext } from "lib/school.js";
export const access="user";
export const methods=["GET"];
export default async function(req,res){
 const ctx=await schoolContext(req.user),id=ctx.school_id;
 const [students,staff,classes,fees,attendance,payments,announcements]=await Promise.all([
 db.query("SELECT count(*)::int AS n FROM students WHERE school_id=$1 AND status='active'",[id]),
 db.query("SELECT count(*)::int AS n FROM staff WHERE school_id=$1 AND status='active'",[id]),
 db.query("SELECT count(*)::int AS n FROM classes WHERE school_id=$1",[id]),
 db.query("SELECT COALESCE(sum(amount),0) AS expected,COALESCE(sum(paid_amount),0) AS collected FROM fee_invoices WHERE school_id=$1",[id]),
 db.query("SELECT count(*) FILTER(WHERE status='present')::int AS present,count(*)::int AS total FROM attendance WHERE school_id=$1 AND attendance_date=CURRENT_DATE",[id]),
 db.query("SELECT id,amount,method,reference,paid_at FROM payments WHERE school_id=$1 ORDER BY paid_at DESC LIMIT 5",[id]),
 db.query("SELECT id,title,audience,created_at FROM announcements WHERE school_id=$1 ORDER BY created_at DESC LIMIT 5",[id])
 ]);
 res.json({school:ctx.school_name,role:ctx.role,students:students.rows[0].n,staff:staff.rows[0].n,classes:classes.rows[0].n,expectedFees:Number(fees.rows[0].expected),collectedFees:Number(fees.rows[0].collected),outstandingFees:Number(fees.rows[0].expected)-Number(fees.rows[0].collected),attendance:attendance.rows[0].total?Math.round(attendance.rows[0].present/attendance.rows[0].total*100):0,recentPayments:payments.rows,recentAnnouncements:announcements.rows});
}