export async function logout() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = localStorage.getItem("accessToken");

  const response = await fetch(`${baseUrl}/member/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
}
