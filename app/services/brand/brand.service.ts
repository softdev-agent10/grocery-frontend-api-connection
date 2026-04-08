const BASE_URL =  "http://192.168.0.102:8000/api/v1";

export const getBrands = async ({ branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/brands?branch_id=${branchId}`,
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
    throw new Error("Failed to fetch brands");
  }

  return res.json();
};



export const createBrands = async ({ branchId, token, name, image }: any) => {
  const res = await fetch(
    `${BASE_URL}/inventory/brands?branch_id=${branchId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        name: name,
        brand_image: image || "https://example.com/default-brand-image.png",
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to create brands");
  }

  return res.json();
};

export const updateBrands = async ({
  brandId,
  branchId,
  token,
  name,
  brand_image,
}: {
  brandId: number;
  branchId: number;
  token: string;
  name: string;
  brand_image: string;
}) => {
  const res = await fetch(
    `${BASE_URL}/inventory/brands/${brandId}?branch_id=${branchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
      body: JSON.stringify({
        name,
        brand_image, // ✅ correct key
      }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update brand");
  }

  return res.json();
};


// http://192.168.0.109:8000/api/v1/inventory/brands?branch_id=1234567890 net::ERR_CONNECTION_TIMED_OUT