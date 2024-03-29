import { useCallback, useEffect, useState } from "react";
import { Button, Card, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { excelToArrayOfArrays, exportToExcel, getColumnsWidth } from "../utils";
import { FixedSizeList as List } from "react-window";
import { Link } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export type csvData = (string | number)[][];

const AutoMatch = () => {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [secFile, setSecFile] = useState<File | null>(null);
  const [mainFileData, setMainFileData] = useState<csvData | null>(null);
  const [secFileData, setSecFileData] = useState<csvData | null>(null);
  const [newFile, setNewFile] = useState<csvData | null>(null);

  const Row = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const row = mainFileData ? mainFileData[index] : [];
    return (
      <Grid container spacing={2} sx={style}>
        {row.map((cell, i) => (
          <Grid item key={i} xs={getColumnsWidth(row.length, i)}>
            {cell}
          </Grid>
        ))}
      </Grid>
    );
  };

  const RowSec = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const row = secFileData ? secFileData[index] : [];
    return (
      <Grid container spacing={2} sx={style}>
        {row.map((cell, i) => (
          <Grid item key={i} xs={getColumnsWidth(row.length, i, false)}>
            {cell}
          </Grid>
        ))}
      </Grid>
    );
  };

  const RowNew = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const row = newFile ? newFile[index] : [];
    return (
      <Grid container spacing={2} sx={style}>
        {row.map((cell, i) => (
          <Grid item key={i} xs={getColumnsWidth(row.length, i, false)}>
            {cell}
          </Grid>
        ))}
      </Grid>
    );
  };

  useEffect(() => {
    const getFileData = async (file: File) => {
      const data = await excelToArrayOfArrays(file);
      setMainFileData(data);
    };
    if (mainFile) {
      getFileData(mainFile);
    }
  }, [mainFile]);

  useEffect(() => {
    const getFileData = async (file: File) => {
      const data = await excelToArrayOfArrays(file);
      setSecFileData(data);
    };
    if (secFile) {
      getFileData(secFile);
    }
  }, [secFile]);

  const match = useCallback((mainFileData: csvData, secFileData: csvData) => {
    const newFile: csvData = [[...secFileData[0], "رقم الصـرف"]];

    const matchingColumns = mainFileData[0].filter((column) =>
      secFileData[0].includes(column)
    );

    const matchingIndexInMainFile = mainFileData[0].reduce((acc, column, i) => {
      if (matchingColumns.includes(column)) {
        acc.push(i);
      }
      return acc;
    }, [] as number[]);

    const matchingIndexInSecFile = secFileData[0].reduce((acc, column, i) => {
      if (matchingColumns.includes(column)) {
        acc.push(i);
      }
      return acc;
    }, [] as number[]);

    secFileData.slice(1).forEach((row) => {
      const matchRow = mainFileData.find((mainRow) =>
        // any matching rows using the matching indexes
        matchingIndexInMainFile.some(
          (i, index) => mainRow[i] === row[matchingIndexInSecFile[index]]
        )
      );
      if (matchRow) {
        newFile.push([...row, matchRow[1]]);
      } else {
        newFile.push([...row, "غير موجود فى الملف الرئيسى"]);
      }
    });

    // sort so that any row wihtout a match is at the top
    setNewFile(
      newFile.sort((a, b) => {
        if (a[a.length - 1] === "غير موجود فى الملف الرئيسى") {
          // make sure we don't raise it above the first row
          if (b[b.length - 1] === "رقم الصـرف") {
            return 0;
          }
          return -1;
        }

        return 0;
      })
    );
  }, []);
  return (
    <Grid
      container
      spacing={3}
      sx={{
        p: 4,
      }}
    >
      <Grid item xs={6}>
        <Card
          elevation={3}
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button variant="contained">
                <Link to="/man">ذهاب الى المطابقة اليدوية</Link>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">الملف الرئيسى</Typography>
              <Typography variant="body2">
                يجب ان يكون رقم الصـرف فى العمود الثانى
              </Typography>
              <Typography variant="body2">
                يجب ان تتطابق كلمة الاسم او الرقم فى الملف الثانوى
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
              >
                اختر ملف
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setMainFile(e.target.files[0]);
                    }
                  }}
                  // only allow .csv and .xlsx files
                  accept=".csv,.xlsx"
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">محتويات الملف</Typography>
            </Grid>
            <Grid item xs={12}>
              <List
                direction="rtl"
                height={250}
                itemCount={mainFileData?.length || 0}
                itemSize={46}
                width="100%"
              >
                {Row}
              </List>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={6}>
        <Card
          elevation={3}
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Button variant="contained">
                <Link to="/man">ذهاب الى المطابقة اليدوية</Link>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">الملف الثانوى</Typography>

              <Typography variant="body2">
                يجب ان يتواجب عمود للاسم او عمود للرقم القومى
              </Typography>

              <Typography variant="body2">
                يجب ان يوجد تطابق للاسم او الرقم القومى فى الملف الرئيسى
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
              >
                اختر ملف
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e) => {
                    if (e.target.files) {
                      setSecFile(e.target.files[0]);
                    }
                  }}
                  // only allow .csv and .xlsx files
                  accept=".csv,.xlsx"
                />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">محتويات الملف</Typography>
            </Grid>
            <Grid item xs={12}>
              <List
                direction="rtl"
                height={250}
                itemCount={secFileData?.length || 0}
                itemSize={46}
                width="100%"
              >
                {RowSec}
              </List>
            </Grid>
          </Grid>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card
          elevation={3}
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">النتيجة</Typography>
            </Grid>
            <Grid item container xs={12} gap={3}>
              <Button
                variant="contained"
                onClick={() => {
                  if (mainFileData && secFileData) {
                    match(mainFileData, secFileData);
                  }
                }}
              >
                مطابقة
              </Button>

              <Button
                variant="contained"
                disabled={!newFile}
                onClick={() => {
                  exportToExcel(newFile || []);
                }}
              >
                تنزيل
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">محتويات الملف</Typography>
            </Grid>
            <Grid item xs={12}>
              <List
                direction="rtl"
                height={250}
                itemCount={newFile?.length || 0}
                itemSize={46}
                width="100%"
              >
                {RowNew}
              </List>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};
export default AutoMatch;
