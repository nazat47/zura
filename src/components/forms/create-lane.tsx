import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { useModal } from "@/hooks/use-modal";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getPipelineDetails,
  saveActivityLogsNotification,
  upsertLane,
} from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { Lane } from "@prisma/client";
import { LaneFormSchema } from "@/lib/types";

type Props = {
  pipelineId: string;
  defaultData?: Lane;
};

const LaneForm = ({ pipelineId, defaultData }: Props) => {
  const { setClose } = useModal();
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || "",
    },
  });

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || "",
      });
    }
    //eslint-disable-next-line
  }, [defaultData]);

  const isLoading = form.formState.isLoading;

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    if (!pipelineId) return;
    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
      });

      const d = await getPipelineDetails(pipelineId);
      if (!d) return;

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a lane | ${response?.name}`,
        subaccountId: d.subAccountId,
      });

      toast({
        title: "Success",
        description: "Saved pipeline details",
      });

      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oppse!",
        description: "Could not save pipeline details",
      });
    }
    setClose();
  };

  return (
    <Card className="w-full ">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Lane Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default LaneForm;
