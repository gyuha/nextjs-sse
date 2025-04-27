"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal/modal";
import { uuid } from "@/lib/utils";
import useModal from "@/stores/modal-store";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const InputForm = () => {
  const { openModal, closeModal } = useModal();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    openModal({
      title: "You submitted the following values:",
      content: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <Modal.Content>
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Modal.Content>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={closeModal}>
            Close
          </Button>
          <Button type="submit">Submit</Button>
        </Modal.Footer>
      </form>
    </Form>
  );
};

const CustomModalContent = () => {
  const { closeModal, openModal } = useModal();
  return (
    <div className="w-[340px] rounded-md p-4">
      <h1 className="font-semibold text-lg">Custom Modal {uuid()}</h1>
      <Button
        variant={"default"}
        onClick={() =>
          openModal({
            title: `modal #${uuid()}`,
            custom: <CustomModalContent />,
            size: "md",
          })
        }
      >
        Open Modal
      </Button>
      <Button variant={"secondary"} onClick={() => closeModal()}>
        Close
      </Button>
    </div>
  );
};

const ModalTest = (): React.JSX.Element | null => {
  const { openModal } = useModal();

  return (
    <div className="m-12">
      <Card className="w-full m-1">
        <CardHeader>
          <CardTitle>모달</CardTitle>
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
          <CardTitle>모달 종류 별</CardTitle>
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
          <CardTitle>모달 커스텀</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant={"default"}
            onClick={() =>
              openModal({
                title: `modal #${uuid()}`,
                custom: <CustomModalContent />,
                size: "md",
              })
            }
          >
            Open
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full m-1">
        <CardHeader>
          <CardTitle>모달 Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant={"default"}
            onClick={() =>
              openModal({
                title: `modal #${uuid()}`,
                custom: <InputForm />,
                size: "md",
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

export default ModalTest;
