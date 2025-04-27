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

const CustomModalContent = ({ size }: any) => {
  const { closeModal } = useModal();
  return (
    <div className="w-[340px] rounded-md p-4">
      <h1 className="font-semibold text-lg">Custom Modal</h1>
      <Button variant={"secondary"} onClick={() => closeModal()}>
        Close
      </Button>
    </div>
  );
};

const Modal = (): React.JSX.Element | null => {
  const { openModal } = useModal();

  return (
    <div className="m-12">
      <Card className="w-full m-1">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
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

      <Card className="w-full m-1">
        <CardHeader>
          <CardTitle>Modal</CardTitle>
          <CardDescription>Modal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-row gap-2">
            <Button
              variant={"default"}
              onClick={() =>
                openModal({
                  alert: "알랏!!!",
                })
              }
            >
              Open (FULL)
            </Button>
            <Button variant={"default"} onClick={() => openModal("알랏!!!")}>
              Open (String)
            </Button>
            <Button
              variant={"default"}
              onClick={() =>
                openModal(<div className="text-red-900">열려라!</div>)
              }
            >
              Open (JSX.Element)
            </Button>
            <Button
              variant={"default"}
              onClick={() => openModal("알랏!!!", true)}
            >
              Open (String) no bottom bar
            </Button>
            <Button
              variant={"default"}
              onClick={() =>
                openModal(<div className="text-red-900">열려라!</div>, true)
              }
            >
              Open (JSX.Element) no bottom bar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full m-1">
        <CardHeader>
          <CardTitle>Modal</CardTitle>
          <CardDescription>Modal</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant={"default"}
            onClick={() =>
              openModal({
                title: `modal #${uuid()}`,
                custom: <CustomModalContent />,
                size: 'md',
              })
            }
          >
            Open
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Modal;
