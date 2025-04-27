"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uuid } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import type React from "react";

const Modal = (): React.JSX.Element | null => {
  const { openModal } = useModal();

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            openModal({
              title: `modal #${uuid()}`,
              info: `test
information`,
              content: "Hello, Modal!!!!",
              size: "lg",
            });
          }}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  );
};

export default Modal;
