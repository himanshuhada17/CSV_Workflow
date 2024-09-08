// import Image from "next/image";
// import localFont from "next/font/local";
// import FlowComponent from "@/components/FlowComponent";

// export default function Home() {
//   return (
//     <>
//     <FlowComponent/>
//     </>
//   );
// }
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

// Dynamically import the components with server-side rendering disabled
const FlowComponent = dynamic(() => import("@/components/FlowComponent"), {
  ssr: false,
});
const CsvUploader = dynamic(() => import("@/components/CsvUploader"), {
  ssr: false,
});

const router =
  typeof window !== "undefined"
    ? createBrowserRouter([
        {
          path: "/",
          element: <FlowComponent />,
        },
        {
          path: "/CsvUploader",
          element: <CsvUploader />,
        },
      ])
    : null;

export default function Home() {
  // Create router instance only on client-side
  useEffect(() => {
    // No-op, as router is already created above conditionally
  }, []);

  return (
    <>
      <ToastContainer />
      {typeof window !== "undefined" && router && (
        <RouterProvider router={router} />
      )}
    </>
  );
}
