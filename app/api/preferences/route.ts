import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { preferenceNameMap, UserPreferenceParams } from "@/types/preference";

export async function POST(req: NextRequest) {
  const body: UserPreferenceParams = await req.json();

  const c = cookies();

  if (body.collectionSideFilterVisible) {
    c.set(
      preferenceNameMap.collectionSideFilterVisible,
      body.collectionSideFilterVisible,
      {
        httpOnly: false,
        secure: true,
        name: preferenceNameMap.collectionSideFilterVisible,
      }
    );
  }

  if (body.agentSideWalletVisible) {
    c.set(
      preferenceNameMap.agentSideWalletVisible,
      body.agentSideWalletVisible,
      {
        httpOnly: false,
        secure: true,
        name: preferenceNameMap.agentSideWalletVisible,
      }
    );
  }

  const data = { data: null, status: 200 };

  return NextResponse.json(data);
}
