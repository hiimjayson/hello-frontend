import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { NextResponse } from "next/server";

// Google Sheets API 인증 설정
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: SCOPES,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Google Spreadsheet 문서 접근
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, jwt);
    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    // 데이터 추가
    await sheet.addRow({
      timestamp: new Date().toISOString(),
      occupation: data.occupation,
      interest_reasons: data.interest_reasons.join(", "),
      detailed_reason: data.detailed_reason,
      email: data.email || "",
      social_support: data.social_support ? "Y" : "N",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "제출 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
