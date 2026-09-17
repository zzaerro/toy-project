"use client";

import { useState, type FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MAX_RESULTS,
  searchIngredientsBySymptom,
  type SymptomSearchResult,
} from "@/lib/ingredients";

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SymptomSearchResult | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(searchIngredientsBySymptom(query));
  }

  return (
    <div className="flex flex-1 justify-center bg-muted/30">
      <main className="flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            증상으로 성분 찾기
          </h1>
          <p className="text-sm text-muted-foreground">
            증상을 한 줄로 입력하면, 식약처가 그 증상과 관련해 기능성을
            인정한 성분과 근거를 보여드립니다.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="symptom">증상</Label>
            <Input
              id="symptom"
              name="symptom"
              placeholder="예: 잠을 잘 못 잔다"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Button type="submit">찾기</Button>
        </form>

        {result?.status === "emergency" && (
          <Alert variant="destructive">
            <AlertTitle>병원 진료가 필요합니다</AlertTitle>
            <AlertDescription>
              입력하신 증상은 응급의료에 관한 법률 시행규칙이 정한
              응급증상({result.category.label})에 해당하는 것으로
              보입니다. 이는 저희가 정한 기준이 아니라 법이 정한
              기준입니다. 가까운 병원이나 응급실을 방문하거나 119에
              연락하시기 바랍니다.
              {result.category.isMentalHealth && (
                <>
                  {" "}
                  혼자 감당하기 어렵다면 자살예방상담전화 1393(24시간,
                  통화료 무료)으로도 연락해보세요.
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {result?.status === "matched" && (
          <section className="flex flex-col gap-4">
            <Alert>
              <AlertTitle>영양 성분은 치료제가 아닙니다</AlertTitle>
              <AlertDescription>
                여기서 안내하는 성분은 치료 목적이 아니라 보조적인 도움을
                줄 수 있는 정보입니다. 증상이 계속되면 의료 전문가와
                상담하시기 바랍니다.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p>
                입력하신 증상을{" "}
                <Badge variant="secondary">{result.category.label}</Badge>{" "}
                기능성 범주로 해석했습니다. 이는 서비스의 해석입니다.
              </p>
              <p>
                관련 성분 {result.totalMatched}건 중 먼저 인정받은 순으로{" "}
                {result.ingredients.length}건을 보여드립니다.
              </p>
              {result.totalMatched < MAX_RESULTS && (
                <p>
                  관련 성분이 {MAX_RESULTS}건보다 적어 있는 만큼만
                  보여드립니다.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {result.ingredients.map((ingredient) => (
                <Card key={ingredient.id}>
                  <CardHeader>
                    <CardTitle>{ingredient.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">인정된 기능성</p>
                      <ul className="list-disc pl-5 text-sm">
                        {ingredient.functionalityClaims.map((claim) => (
                          <li key={claim}>{claim}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">1일 섭취량</p>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.dailyIntakeOptions.length > 0
                          ? ingredient.dailyIntakeOptions.join(" · ")
                          : "정보 없음"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">섭취 시 주의사항</p>
                      <p className="text-sm text-muted-foreground">
                        {ingredient.precaution ?? "없음"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert>
              <AlertTitle>증상이 오래 계속된다면</AlertTitle>
              <AlertDescription>
                며칠 이상 증상이 계속되거나 나아지지 않는다면, 다른 원인이
                있을 수 있습니다. 병원에서 정확한 진단을 받아보시기
                바랍니다.
              </AlertDescription>
            </Alert>
          </section>
        )}

        {result?.status === "unmatched" && (
          <section className="flex flex-col gap-3">
            <Alert variant="destructive">
              <AlertTitle>연결에 실패했습니다</AlertTitle>
              <AlertDescription>
                입력하신 증상을 다룰 수 있는 기능성 범주로 잇지 못했습니다.
                아래 범주에 해당하는 증상으로 다시 시도해보세요.
              </AlertDescription>
            </Alert>
            <div className="flex flex-wrap gap-2">
              {result.availableCategories.map((category) => (
                <Badge key={category.id} variant="outline">
                  {category.label}
                </Badge>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
