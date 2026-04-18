const BASE_URL = process.env.NEXT_PUBLIC_API_URI;

// /api/v1/tools/customer
export const getCustomers = async ({ branchId, token }: any) => {
  const res = await fetch(
    `${BASE_URL}/tools/customer?branch_id=${branchId}`,
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
    throw new Error("Failed to fetch customers");
  }

  return res.json();
};


// create new 
export const createCustomer = async ({ data, token }: any) => {
  const res = await fetch(
  `${BASE_URL}/tools/customer?branch_id=${data.branch_id}`,
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