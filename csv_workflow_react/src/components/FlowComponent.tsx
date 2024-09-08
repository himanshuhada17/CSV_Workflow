import { Menu, MenuItem } from "@mui/material";
import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "react-flow-renderer";
import { CiMenuBurger } from "react-icons/ci";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const initialNodeTemplates = [
  {
    id: "filter-data",
    type: "default",
    data: { label: "1. Filter Data" },
    position: { x: 0, y: 0 },
  },
  {
    id: "wait",
    type: "default",
    data: { label: "2. Wait" },
    position: { x: 0, y: 0 },
  },
  {
    id: "convert-format",
    type: "default",
    data: { label: "3. Convert Format" },
    position: { x: 0, y: 0 },
  },
  {
    id: "send-post-request",
    type: "default",
    data: { label: "4. Send POST Request" },
    position: { x: 0, y: 0 },
  },
  {
    id: "end",
    type: "default",
    data: { label: "5. End" },
    position: { x: 0, y: 0 },
  },
];

const FlowComponent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  console.log("nodes_value", nodes);
  console.log("edges_value", edges);
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDrop = useCallback(
    (event: any) => {
      event.preventDefault();

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const newNode = {
        id: `${type}-${+new Date()}`,
        type: "default",
        position,
        data: { label: `${type}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: any) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragStart = (event: any, nodeType: any) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };
  const handleReset = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleClick = (event: any) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const saveWorkflow = async () => {
    try {
      const response = await fetch("http://localhost:4001/createWorkflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ edges }),
      });

      if (response.ok) {
        toast.success("Workflow saved successfully!");
      } else {
        alert("Failed to save workflow.");
      }
    } catch (error) {
      console.error("Error saving workflow:", error);
      alert("An error occurred while saving the workflow.");
    }
  };

  return (
    <div className="flex h-[100vh]">
      <div className="p-3 border-r-[1px] w-32 sm:w-56">
        <div className="sm:flex items-center">
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

          <button
            onClick={handleReset}
            className="p-2 rounded-lg border-[1px] mb-2"
          >
            Reset Canvas
          </button>
        </div>
        {initialNodeTemplates.map((node) => (
          <div
            key={node.id}
            onDragStart={(event) => handleDragStart(event, node.data.label)}
            draggable
            className="mb-[10px] p-[10px] border-[1px] rounded-lg cursor-pointer"
          >
            {node.data.label}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div className="flex justify-end pr-5 pt-2 items-center gap-4">
          <button
            className="p-2 border-[1px] bg-blue-500 text-white  rounded-lg"
            onClick={saveWorkflow}
          >
            Save Workflow
          </button>
        </div>

        <ReactFlowProvider>
          <div className="h-screen " onDrop={onDrop} onDragOver={onDragOver}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            />
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default FlowComponent;
