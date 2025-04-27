"use client";
import { Button } from "@/components/ui/button";
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
import type React from "react";
import { z } from "zod";
import { useChannelContext } from "./channel-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useModal from "@/stores/modal-store";
import { use } from "react";
import { fa } from "@faker-js/faker";
import { faker } from "@faker-js/faker/locale/ko";

const FormSchema = z.object({
  channelName: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const ChannelMakeModal = (): React.JSX.Element | null => {
  // const { channels, username } = useChannelContext();
  const { openModal, closeModal } = useModal();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      channelName: faker.lorem.word(),
      username: faker.person.fullName(),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="channelName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>채널 이름</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                사용자 이름 
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit">입장하기</Button>
      </form>
    </Form>
  );
};

export default ChannelMakeModal;
