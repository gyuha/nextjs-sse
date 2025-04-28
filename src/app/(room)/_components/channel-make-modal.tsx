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
import type { Channel } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useModal from "@/stores/modal-store";
import { faker } from "@faker-js/faker/locale/ko";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useChannelContext } from "./channel-provider";
import { set } from "date-fns";
import { Users } from "lucide-react";

const FormSchema = z.object({
  channelName: z.string().min(2, {
    message: "채널 이름은 최소 2자 이상이어야 합니다.",
  }),
  username: z.string().min(2, {
    message: "사용자 이름은 최소 2자 이상이어야 합니다.",
  }),
});

const ChannelMakeModal: React.FC<{
  triggerProps: React.ComponentProps<typeof DialogTrigger>;
}> = ({ triggerProps }) => {
  const [open, setOpen] = useState(false);
  const { channels } = useChannelContext();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      channelName: faker.lorem.word(),
      username: faker.person.fullName(),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // 중복된 채널 이름 확인
    const isDuplicate = channels.some(
      (channel) => channel.name?.toLowerCase() === data.channelName.toLowerCase()
    );

    if (isDuplicate) {
      form.setError("channelName", {
        type: "manual",
        message: "이미 존재하는 채널 이름입니다. 다른 이름을 사용해주세요.",
      });
      return;
    }

    // 여기서 채널 생성 로직을 구현할 수 있습니다
    // ...

    setOpen(false); // 모달 닫기
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger {...triggerProps} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>채팅방 생성</DialogTitle>
        </DialogHeader>
        {/* 현재 채널 목록 표시 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">현재 채널 목록</h3>
          <ScrollArea className="h-24 rounded-md border p-2">
            <div className="flex flex-wrap gap-2">
              {channels.map((channel) => (
                <Badge key={channel.id} variant="outline">
                  {channel.name || channel.id} - <Users />{channel.userCount}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* 채널 생성 폼 */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="channelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>채널 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="새 채널 이름 입력" {...field} />
                  </FormControl>
                  <FormDescription>
                    생성할 채널의 이름을 입력하세요
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
                    <Input placeholder="사용자 이름 입력" {...field} />
                  </FormControl>
                  <FormDescription>채널에서 사용할 이름</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit">
              채널 생성 및 입장
            </Button>
          </form>
        </Form>
        <DialogFooter>{/* Footer */}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChannelMakeModal;
