"use client";
import { useModal } from "@/hooks/use-modal";
import { useToast } from "@/hooks/use-toast";
import {
  getSubAccountTeamMembers,
  saveActivityLogsNotification,
  searchContacts,
  upsertTicket,
} from "@/lib/queries";
import { TicketFormSchema, TicketWithTags } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Tag, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CheckIcon, ChevronsUpDown, User2 } from "lucide-react";
import { SelectItem } from "@radix-ui/react-select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import Loading from "../global/loading";
import TagCreator from "../global/tag-creator";

type Props = {
  getNewTicket: (ticket: TicketWithTags[0]) => void;
  subaccountId: string;
  laneId: string;
};

const TicketForm = ({ getNewTicket, subaccountId, laneId }: Props) => {
  const { data: defaultData, setClose } = useModal();
  const router = useRouter();
  const { toast } = useToast();
  const [tags, setTags] = useState<Tag[]>([]);
  const [contact, setContact] = useState("");
  const [search, setSearch] = useState("");
  const [contactList, setContactList] = useState<Contact[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<User[]>([]);
  const [assignedTo, setAssignedTo] = useState(
    defaultData.ticket?.Assigned?.id || "user_2qs9pZ1csm4CGWo2d7VQCpPLkHW"
  );
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const form = useForm<z.infer<typeof TicketFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(TicketFormSchema),
    defaultValues: {
      name: defaultData.ticket?.name || "",
      description: defaultData.ticket?.description || "",
      value: String(defaultData.ticket?.value || 0),
    },
  });
  const isLoading = form.formState.isLoading;

  useEffect(() => {
    if (subaccountId) {
      const fetchData = async () => {
        const response = await getSubAccountTeamMembers(subaccountId);
        if (response) setAllTeamMembers(response);
      };
      fetchData();
    }
  }, [subaccountId]);

  useEffect(() => {
    if (defaultData.ticket) {
      form.reset({
        name: defaultData.ticket.name || "",
        description: defaultData.ticket?.description || "",
        value: String(defaultData.ticket?.value || 0),
      });
      if (defaultData.ticket.customerId)
        setContact(defaultData.ticket.customerId);

      const fetchData = async () => {
        const response = await searchContacts(
          //@ts-ignore
          defaultData.ticket?.Customer?.name
        );
        setContactList(response);
      };
      fetchData();
    }
    //eslint-disable-next-line
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof TicketFormSchema>) => {
    if (!laneId) return;
    try {
      const response = await upsertTicket(
        {
          ...values,
          laneId,
          id: defaultData.ticket?.id,
          assignedUserId: assignedTo,
          ...(contact ? { customerId: contact } : {}),
        },
        tags
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a ticket | ${response?.name}`,
        subaccountId,
      });

      toast({
        title: "Success",
        description: "Saved  details",
      });
      if (response) getNewTicket(response);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ticket Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ticket Value</FormLabel>
                  <FormControl>
                    <Input placeholder="Value" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h3>Add tags</h3>
            <TagCreator
              subAccountId={subaccountId}
              getSelectedTags={setTags}
              defaultTags={defaultData?.ticket?.Tags || []}
            />
            <FormLabel>Assigned To Team Member</FormLabel>
            <Select
              onValueChange={setAssignedTo}
              defaultValue={"user_2qs9pZ1csm4CGWo2d7VQCpPLkHW"}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        Not Assigned
                      </span>
                    </div>
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {allTeamMembers.map((teamMember) => (
                  <SelectItem
                    key={teamMember.id}
                    value={"user_2qs9pZ1csm4CGWo2d7VQCpPLkHW"}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage alt="contact" src={teamMember.avatarUrl} />
                        <AvatarFallback className="bg-primary text-sm text-white">
                          <User2 size={14} />
                        </AvatarFallback>
                      </Avatar>

                      <span className="text-sm text-muted-foreground">
                        {teamMember.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormLabel>Customer</FormLabel>
            <Popover>
              <PopoverTrigger asChild className="w-full">
                <Button
                  variant={"outline"}
                  role={"combobox"}
                  className="justify-between"
                >
                  {contact
                    ? contactList.find((c) => c.id === contact)?.name
                    : "Select Customer..."}
                  <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px p-0">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    className="h-9"
                    value={search}
                    onChangeCapture={async (value) => {
                      //@ts-ignore
                      setSearch(value.target.value);
                      if (saveTimerRef.current)
                        clearTimeout(saveTimerRef.current);
                      saveTimerRef.current = setTimeout(async () => {
                        const response = await searchContacts(
                          //@ts-ignore
                          value.target.value
                        );
                        setContactList(response);
                        setSearch("");
                      }, 1000);
                    }}
                  />
                  <CommandEmpty>No Customer Found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {contactList.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.id}
                          onSelect={(currentValue) => {
                            setContact(
                              currentValue === contact ? "" : currentValue
                            );
                          }}
                        >
                          {c.name}
                          <CheckIcon
                            className={cn(
                              "ml-auto h-4 w-4",
                              contact === c.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button className="w-20 mt-4" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? <Loading /> : "Save"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TicketForm;