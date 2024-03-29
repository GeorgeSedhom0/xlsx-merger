import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
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

const ManMatch = () => {
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainFileData, setMainFileData] = useState<string[][] | null>(null);
  const [newFile, setNewFile] = useState<string[][]>([
    ["م", "رقم الصرف", "الاسم", "الرقم القومى"],
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<{ id: number; str: string }[]>([]);
  const [query, setQuery] = useState<string>("");
  const [columns, setColumns] = useState<string[]>([]);
  const [columnsValues, setColumnsValues] = useState<string[]>([]);
  const [lock, setLock] = useState<boolean>(false);

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
    if (!mainFileData) return;
    if (!query) setOptions([]);

    const matches: { id: number; str: string }[] = [];
    mainFileData.slice(1).forEach((row, _) => {
      if (row.length < 4) return;
      if (row[2].includes(query) || `${row[3]}`.includes(query)) {
        matches.push({ id: parseInt(row[0]), str: row[2] });
      }
    });
    setOptions(matches.slice(0, 10));
  }, [query, mainFileData]);

  return (
    <Grid
      container
      spacing={3}
      sx={{
        p: 4,
      }}
    >
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
              <Button variant="contained">
                <Link to="/">ذهاب الى المطابقة التلقائية</Link>
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">الملف الرئيسى</Typography>
              <Typography variant="body2">
                يحب ان يكون الاسم فى العمود الثالت
              </Typography>
              <Typography variant="body2">
                يجب ان يكون الرقم القومى فى العمود الرابع
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

      <Grid item xs={12}>
        <Card
          elevation={3}
          sx={{
            px: 2,
            py: 3,
          }}
        >
          <Grid container spacing={3}>
            <Grid item container xs={12} gap={3}>
              <TextField
                label="العواميد الاضافية"
                onChange={(e) => {
                  setColumns(e.target.value.split("-"));
                }}
                value={columns.join("-")}
                disabled={lock}
              />
              <Button
                variant="contained"
                onClick={() => {
                  setLock(true);
                  setColumnsValues(new Array(columns.length).fill(""));
                  setNewFile([[...newFile[0], ...columns]]);
                }}
                disabled={lock}
              >
                تثبيت
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">النتيجة</Typography>
            </Grid>

            <Grid item container xs={12} gap={3} alignItems="center">
              <Autocomplete
                options={options}
                getOptionLabel={(option) => option.str}
                isOptionEqualToValue={(option, value) => {
                  return option.id === value.id;
                }}
                filterOptions={x=>x}
                style={{ width: 300 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="البحث"
                    onChange={(e) => {
                      setQuery(e.target.value);
                    }}
                  />
                )}
                onChange={(_, value) => {
                  setSelectedIndex(value ? value.id : null);
                }}
              />
              {selectedIndex !== null &&
                mainFileData &&
                mainFileData[selectedIndex].map((cell, i) => (
                  <Typography variant="body1" key={i}>
                    {cell}
                  </Typography>
                ))}
            </Grid>

            <Grid item container xs={12} gap={3}>
              {columns.length > 0 &&
                selectedIndex !== null &&
                columns.map((column, i) => (
                  <TextField
                    key={i}
                    label={column}
                    value={columnsValues[i]}
                    onChange={(e) => {
                      const newColumnsValues = [...columnsValues];
                      newColumnsValues[i] = e.target.value;
                      setColumnsValues(newColumnsValues);
                    }}
                  />
                ))}
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => {
                  if (!selectedIndex) return;
                  if (!columnsValues.length) return;
                  if (!mainFileData) return;
                  const newRow =
                    mainFileData[selectedIndex].concat(columnsValues);

                  setNewFile([...newFile, newRow]);
                  setColumnsValues(new Array(columns.length).fill(""));
                  setSelectedIndex(null);
                }}
                disabled={
                  !selectedIndex || !columnsValues.length || !mainFileData
                }
              >
                اضافة
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

            <Grid item xs={12}>
              <Button
                variant="contained"
                onClick={() => {
                  if (!mainFileData) return;
                  if (!newFile) return;
                  exportToExcel(newFile);
                }}
              >
                حفط
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </Grid>
  );
};
export default ManMatch;
