const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("NO_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const uploadReceipt = async (expenseId: number, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("receipt", file);

  const response = await fetch(`/api/receipts/${expenseId}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Échec de l'upload du reçu");
  }
};

export const downloadReceipt = async (expenseId: number): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("NO_TOKEN");

  const response = await fetch(`/api/receipts/${expenseId}/download?token=${encodeURIComponent(token)}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Reçu non trouvé");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `receipt-${expenseId}.${response.headers.get("content-type")?.split("/")[1] || "file"}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const getReceiptViewUrl = (expenseId: number): string => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("NO_TOKEN");
  }
  const url = `/api/receipts/${expenseId}/view?token=${encodeURIComponent(token)}`;
  return url;
};