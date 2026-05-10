export async function logout() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const accessToken = sessionStorage.getItem("accessToken");
  const fcmToken = localStorage.getItem("fcmToken");

  if (accessToken && fcmToken) {
    try {
      await fetch(`${baseUrl}/fcm/token`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token: fcmToken }),
      });
    } catch {
      // Ignore delete failures and continue logout.
    }
  }

  const response = await fetch(`${baseUrl}/member/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data;
}
