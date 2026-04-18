const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

// /api/v1/tools/cashin
export const createCashIn = async ({ data, branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/tools/cashin?branch_id=${branchId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const text = await res.text();

  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
};


export const createCashOut = async ({ data, branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/tools/cashout?branch_id=${branchId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const text = await res.text();

  console.log("STATUS:", res.status);
  console.log("RESPONSE:", text);

  if (!res.ok) {
    throw new Error(text);
  }

  return JSON.parse(text);
};


