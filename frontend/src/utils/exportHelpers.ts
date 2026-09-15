export const exportToCSV = (data: any[], filename: string, headers: { key: string; label: string }[]) => {
  if (!data || !data.length) return;

  const headerRow = headers.map((h) => `"${h.label}"`).join(',');
  const dataRows = data.map((row) => {
    return headers
      .map((h) => {
        let val = row[h.key];
        if (val === null || val === undefined) val = '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  // UTF-8 BOM for Excel to open Arabic text correctly
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
