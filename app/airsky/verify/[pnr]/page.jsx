import { VerificationCard } from "@/components/airsky/verification-card";
import { getPNR } from "@/lib/airsky/pnr-database";

export async function generateMetadata({ params }) {
  const { pnr } = await params;
  const upper = (pnr || "").toUpperCase();
  const record = getPNR(upper);

  return {
    title: record
      ? `Verify PNR ${record.pnr} — AirSky Official Verification`
      : `Verify Ticket — AirSky Airline Portal`,
    description: `Real-time digital flight ticket and PNR verification portal for AirSky Airlines.`,
  };
}

export default async function AirSkyVerifyPage({ params }) {
  // In Next.js 16, params is a Promise
  const { pnr } = await params;

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-120px)] flex flex-col justify-center items-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <VerificationCard pnr={pnr} />
    </div>
  );
}
