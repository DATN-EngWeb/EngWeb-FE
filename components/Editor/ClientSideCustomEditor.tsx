"use client";

import dynamic from "next/dynamic";

interface CustomEditorProps {
  data: string;
  onChange: (val: string) => void;
  startingBlankId?: number;
}

const DynamicCustomEditor = dynamic(() => import("./CustomEditor"), {
  ssr: false,
});

const ClientSideCustomEditor = (props: CustomEditorProps) => {
  return <DynamicCustomEditor {...props} />;
};

export default ClientSideCustomEditor;
