"use client";
import {
  deleteSubAccount,
  getSubaccountDetails,
  saveActivityLogsNotification,
} from "@/lib/queries";
import { useRouter } from "next/navigation";
import React from "react";

type Props = {
  subaccountId: string;
};

const DeleteButton = ({ subaccountId }: Props) => {
  const router = useRouter();

  const handleDeleteSubaccount = async () => {
    const response = await getSubaccountDetails(subaccountId);
    await saveActivityLogsNotification({
      agencyId: undefined,
      description: `Deleted a subaccount | ${response?.name}`,
    });
    await deleteSubAccount(subaccountId);
    router.refresh();
  };

  return <div onClick={handleDeleteSubaccount}>Delete Sub Account</div>;
};

export default DeleteButton;
