const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

// /api/v1/tools/customer
export const getCustomers = async ({ branchId, token }: any) => {
  const merchant_id = 9;

  const res = await fetch(
    `${BASE_URL}/tools/customer?merchant_id=${merchant_id}&branch_id=${branchId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const text = await res.text(); 

  console.log("STATUS:", res.status);
  console.log("RAW RESPONSE:", text);

  if (!text) {
    console.warn("Empty response from API");
    return null;
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("Invalid JSON:", err);
    throw new Error("Invalid JSON response");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch customers");
  }

  return data;
};

// create new 
export const createCustomer = async ({branchId, data, token }: any) => {
  const merchant_id = 9;
  const res = await fetch(
  `${BASE_URL}/tools/customer?merchant_id=${merchant_id}&branch_id=${branchId}`,
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