import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

/**
 * إبطال كاش صفحات المنتجات بعد أي تعديل من لوحة التحكّم.
 * الصلاحية تُتحقَّق مقابل الواجهة البرمجية نفسها — لا يوجد سرّ مشترك،
 * والتوكن وحده هو ما يقرّر إن كان صاحبه مديرًا.
 */
export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 });
  }

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { authorization },
    cache: "no-store",
  }).catch(() => null);

  if (!res?.ok) {
    return NextResponse.json({ error: "توكن غير صالح" }, { status: 401 });
  }

  const { user } = (await res.json()) as { user: { role: string } };
  if (user.role !== "admin") {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }

  // expire: 0 يجعل أول طلب تالٍ يُعيد الجلب فورًا بدل تقديم نسخة قديمة،
  // فيرى المدير تعديله في المتجر مباشرة.
  revalidateTag("products", { expire: 0 });
  revalidateTag("categories", { expire: 0 });

  return NextResponse.json({ revalidated: true });
}
