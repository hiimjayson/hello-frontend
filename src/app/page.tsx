"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FormErrors {
  occupation?: string;
  interest_reasons?: string;
  detailed_reason?: string;
  email?: string;
}

export default function Home() {
  const router = useRouter();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const validateForm = (formData: FormData): FormErrors => {
    const errors: FormErrors = {};

    // 직군 검증
    const occupation = formData.get("occupation") as string;
    if (!occupation || occupation.trim().length < 2) {
      errors.occupation = "직군을 2글자 이상 입력해주세요";
    }

    // 흥미 이유 체크박스 검증
    const interestReasons = formData.getAll("interest_reasons");
    if (interestReasons.length === 0) {
      errors.interest_reasons = "하나 이상의 이유를 선택해주세요";
    }

    // 상세 설명 검증
    const detailedReason = formData.get("detailed_reason") as string;
    if (!detailedReason || detailedReason.trim().length < 10) {
      errors.detailed_reason = "10글자 이상 작성해주세요";
    }

    // 이메일 검증
    const email = formData.get("email") as string;
    if (email !== "" && email != null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        errors.email = "올바른 이메일 주소를 입력해주세요";
      }
    }

    return errors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const form = e.currentTarget;
    const formData = new FormData(form);

    // 클라이언트 측 유효성 검사
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // API 엔드포인트로 데이터 전송
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          occupation: formData.get("occupation"),
          interest_reasons: formData.getAll("interest_reasons"),
          detailed_reason: formData.get("detailed_reason"),
          email: formData.get("email"),
          social_support: formData.get("social_support") === "on",
        }),
      });

      if (!response.ok) {
        throw new Error("제출 실패");
      }

      router.push("https://sumins.notion.site/cursor?pvs=4");
    } catch {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto flex flex-col gap-8">
        <Image
          className="rounded-md"
          src="/cursormatfia_color.png"
          alt="Cursor맛피아 로고"
          width={180}
          height={38}
          priority
        />

        <div className="space-y-4">
          <p>안녕하세요! Cursor맛피아입니다.</p>
          <p>제 교육자료에 관심 가져주셔서 감사합니다.</p>
          <p>설문 제출해주시면 자료를 확인하실 수 있습니다.</p>
          <p>
            제출해주신 내용은 더 좋은 교육자료를 만들기 위해 참고할 예정입니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-8">
            <div>
              <label className="block mb-2 font-bold">
                직군을 알려주세요
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="occupation"
                className={`w-full p-2 border rounded-md dark:bg-gray-800 ${
                  errors.occupation ? "border-red-500" : ""
                }`}
              />
              {errors.occupation && (
                <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-bold">
                커서에 흥미를 가지시는 이유가 무엇인가요?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="space-y-2">
                {[
                  "이미 개발을 할 줄 아는데 AI를 잘 써보고싶어서",
                  "이미 개발을 할 줄 아는데 풀스택 개발자가 되고싶어서",
                  "포트폴리오를 만들고싶어서",
                  "만들고싶은 아이디어가 있어서",
                  "업무에 도움이 될 것 같아서",
                  "뭐든 배워두면 좋을 것 같아서",
                ].map((reason) => (
                  <div key={reason} className="flex items-center">
                    <label>
                      <input
                        type="checkbox"
                        name="interest_reasons"
                        value={reason}
                        className="mr-2"
                      />
                      {reason}
                    </label>
                  </div>
                ))}
              </div>
              {errors.interest_reasons && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.interest_reasons}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-bold">
                커서에 흥미를 가지시는 이유를 조금 더 자세하게 설명해주세요
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="detailed_reason"
                className={`w-full p-2 border rounded-md min-h-[100px] dark:bg-gray-800 ${
                  errors.detailed_reason ? "border-red-500" : ""
                }`}
              />
              {errors.detailed_reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.detailed_reason}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-bold">
                비슷한 교육자료 소식을 받아보시려면, 이메일 주소를 입력해주세요
              </label>
              <input
                type="email"
                name="email"
                className={`w-full p-2 border rounded-md dark:bg-gray-800 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <label className="font-bold">
                  <input
                    type="checkbox"
                    name="social_support"
                    className="mr-2"
                  />
                  스레드 게시물 하트+리포스트 부탁드립니다 ㅎㅎ
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-foreground text-background rounded-full py-3 
              ${
                isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:opacity-90"
              }
              transition-opacity`}
          >
            {isSubmitting ? "제출 중..." : "제출하기"}
          </button>
        </form>

        <div className="border-t pt-6">
          <button
            onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <span className="font-bold">개인정보처리방침</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                isPrivacyOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isPrivacyOpen && (
            <div className="mt-4 space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-bold">
                본 개인정보 처리방침은 사용자의 개인정보를 보호하고 관련 법령을
                준수하기 위해 작성되었습니다.
              </p>

              <div className="space-y-4">
                <section>
                  <h3 className="font-bold mb-2">
                    1. 개인정보의 수집 및 이용 목적
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>수집 항목: 이메일 주소</li>
                    <li>이용 목적: 교육 자료 안내 발송</li>
                    <li>
                      수집된 이메일 주소는 명시된 목적 외의 용도로 사용되지
                      않습니다.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold mb-2">2. 개인정보의 보유 및 파기</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      보유 기간: 수집된 개인정보는 동의일로부터 최대 1년간
                      보관됩니다. 보관 기간 종료 시, 즉시 파기됩니다.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="font-bold mb-2">
                    3. 개인정보의 즉시 파기 요청
                  </h3>
                  <p>
                    사용자는 언제든지 개인정보의 즉시 파기를 요청할 수 있습니다.
                    즉시 파기를 원하실 경우, 아래의 이메일로 문의 주시기
                    바랍니다.
                  </p>
                  <p className="mt-2">
                    문의 이메일:{" "}
                    <a
                      href="mailto:ceo@vooster.ai"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      ceo@vooster.ai
                    </a>
                  </p>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
