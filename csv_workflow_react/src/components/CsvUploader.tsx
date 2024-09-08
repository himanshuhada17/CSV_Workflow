import { Button, LinearProgress, Menu, MenuItem } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { FileDrop } from "react-file-drop";
import { CiMenuBurger } from "react-icons/ci";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const csvToJson = (csv: string) => {
  const [headerLine, ...lines] = csv.trim().split("\n");
  const headers = headerLine.split("\t");

  const jsonData = lines.map((line) => {
    const values = line.split("\t");
    const jsonObject: Record<string, string> = {};

    headers.forEach((header, index) => {
      jsonObject[header] = values[index];
    });

    return jsonObject;
  });

  return jsonData;
};

function CSVUploader() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [jsonContent, setJsonContent] = useState<object[]>([]);
  const [lowercasedCsvContent, setLowercasedCsvContent] = useState<string>("");
  const [timer, setTimer] = useState(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState("json");
  const [anchorEl, setAnchorEl] = useState(null);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (file: any) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        setCsvContent(result);
      } else {
        console.error("File content is not a string");
      }
    };

    if (file) {
      reader.readAsText(file);
    }
  };

  const handleFiles = useCallback(
    (files: any) => {
      if (files?.length > 0) {
        const file = files[0];
        if (file.type === "text/csv") {
          handleFileUpload(file);
        } else {
          alert("Please upload a CSV file.");
        }
      }
    },
    [handleFileUpload]
  );

  const handleConvertToJson = () => {
    if (!lowercasedCsvContent) return;
    const jsonData = csvToJson(lowercasedCsvContent);
    setJsonContent(jsonData);
  };

  const handleWait = () => {
    setTimer(60);
    setIsCounting(true);
  };

  useEffect(() => {
    if (isCounting && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setIsCounting(false);
    }
  }, [isCounting, timer]);

  const convertCsvToLowercase = (csv: string) => {
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split("\t");

    const lowercasedData = lines.map((line) => {
      const values = line.split("\t").map((value) => value.toLowerCase());
      return values.join("\t");
    });

    return [headerLine, ...lowercasedData].join("\n");
  };

  const handleConvertToLowercase = () => {
    if (!csvContent) return;
    const lowercasedContent = convertCsvToLowercase(csvContent);
    setLowercasedCsvContent(lowercasedContent);
  };

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchWorkflows = async () => {
    try {
      const response = await fetch("http://localhost:4001/workflows");
      if (!response.ok) {
        throw new Error("Failed to fetch workflows");
      }

      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  const processCsv = async () => {
    if (!csvContent) return toast.error("No CSV content to process");

    const lowercasedCsv = convertCsvToLowercase(csvContent);
    setLowercasedCsvContent(lowercasedCsv);
    setProgress(33);

    handleWait();
    await waitForSeconds(60);
    setProgress(66);

    const jsonData = csvToJson(lowercasedCsv);
    setJsonContent(jsonData);
    setProgress(100);

    sendPostRequest(jsonData);
    toast.success("Post request sent!");
  };

  const waitForSeconds = (seconds: any) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  };

  const sendPostRequest = async (data: any) => {
    try {
      const response = await axios.post(
        "http://localhost:4001/create",
        { message: data },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Data sent successfully:", response.data.message);
    } catch (error) {
      console.error("An error occurred while sending the data:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);
  console.log(selectedOption);

  return (
    <>
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={handleClick}
          className="p-3 mr-3 rounded-lg border-[1px] mb-2"
        >
          <CiMenuBurger />
        </button>
        <Menu
          className="z-[9999999]"
          id="basic-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem className="font-thin">
            <Link to="/">Workflow Dragger</Link>
          </MenuItem>
          <MenuItem className="font-thin">
            <Link to="/CsvUploader">Upload CSV</Link>
          </MenuItem>
        </Menu>
        {timer === 0 ? null : (
          <div className="bg-gray-100 border-green-600 border-2 text-green-600 rounded-full w-fit p-4 flex items-center justify-center">
            {timer} Sec
          </div>
        )}
      </div>

      <div className="flex items-center justify-center">
        <FileDrop
          onDrop={(files) => handleFiles(files)}
          className=" bg-slate-100 p-8 border-2 border-dashed border-gray-300 rounded mx-3 sm:m-0"
        >
          <div className="flex flex-col items-center gap-3">
            Drag and drop a CSV file here or click to select a file
            <IoCloudUploadOutline size={40} />
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: "none" }}
            id="fileInput"
          />
          <div className="w-full flex justify-center mt-4">
            <label htmlFor="fileInput" className="cursor-pointer ml-4">
              <Button variant="contained" component="span">
                Choose File
              </Button>
            </label>
          </div>
        </FileDrop>
      </div>
      <div className="sm:flex sm:space-y-0 space-y-4 justify-center items-center sm:space-x-3 p-4 sm:p-9">
        <span>Select Workflow Id:</span>
        <select
          className="bg-gray-100 outline-none w-full sm:w-64  p-3 pr-0 rounded-xl"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="" disabled>
            Select an option
          </option>
          {workflows?.map((workflow) => (
            <option value={workflow?.id}>{workflow?.id}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-center">
        <button
          onClick={processCsv}
          className="p-2 border-[1px] bg-blue-500 text-white  rounded-lg"
        >
          Run Workflow
        </button>
      </div>
      <div className="flex justify-center mt-3">
        {progress !== 0 ? (
          <LinearProgress
            variant="determinate"
            className="w-[520px]"
            value={progress}
          />
        ) : null}
      </div>
    </>
  );
}

export default CSVUploader;
