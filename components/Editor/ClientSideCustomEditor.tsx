"use client";

import dynamic from "next/dynamic";

interface CustomEditorProps {
  data: string;
  onChange: (val: string) => void;
  startingBlankId?: number;
  onError?: (message: string) => void;
}

const DynamicCustomEditor = dynamic(() => import("./CustomEditor"), {
  ssr: false,
});

const ClientSideCustomEditor = (props: CustomEditorProps) => {
  return <DynamicCustomEditor {...props} />;
};

export default ClientSideCustomEditor;
