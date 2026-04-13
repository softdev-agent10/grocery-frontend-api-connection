const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

export const getUnits = async ({ branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/units?branch_id=${branchId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch units");
  }

  return res.json();
};



export const createUnits = async ({ branchId, token, name, short_name }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/units?branch_id=${branchId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        name,
        short_name, // ✅ FIXED
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create units");
  }

  return res.json();
};

export const updateUnits = async ({
  brandId,
  branchId,
  token,
  name,
  short_name,
}: {
  brandId: string;
  branchId: number;
  token: string;
  name: string;
  short_name: string;
}) => {
  const res = await fetch(
    `${BASE_URL}/inventory/units/${brandId}?branch_id=${branchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      body: JSON.stringify({
        name,
        short_name, // ✅ correct key
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update unit");
  }

  return res.json();
};


// http://192.168.0.109:8000/api/v1/inventory/units