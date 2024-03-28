import * as XLSX from 'xlsx';

export async function excelToArrayOfArrays(file: File): Promise<Array<Array<any>>> {
  const reader = new FileReader();

  return new Promise<Array<Array<any>>>((resolve, reject) => {
    reader.onload = async (event: any) => {
      try {
        const binary = event.target.result;
        const workbook = XLSX.read(binary, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        resolve(data as Array<Array<any>>);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}


export const exportToExcel = (newFile: (string | number)[][]) => {
  if (newFile) {
    // Convert all items to string
    const data = newFile.map(row => row.map(item => item.toString()));

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };

    // Convert data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Append the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Write the workbook to a file and trigger download
    XLSX.writeFileXLSX(wb, "writeFileXLSX.xlsx", {
      bookType: "xlsx",
    });
    XLSX.writeFile(wb, "writeFileXLSM.xlsm", {
      bookType: "xlsm",
    });
    XLSX.writeFile(wb, "writeFileXLSB.xlsb", {
      bookType: "xlsb",
    });
    XLSX.writeFile(wb, "writeFileBIFF8.XLS", {
      bookType: "biff8",
    });
    XLSX.writeFile(wb, "writeFilebiff5.xls", {
      bookType: "biff5",
    });
    XLSX.writeFile(wb, "writeFileBIFF2.xls", {
      bookType: "biff2",
    });
    XLSX.writeFile(wb, "writeFileXLML.xls", {
      bookType: "xlml",
    });
  }
}

export const getColumnsWidth = (len: number, i: number, small: boolean = true) => {
    if (small && i === 0) return 1;
    return (small ? 11 : 12) / (small ? len - 1 : len)
  };

