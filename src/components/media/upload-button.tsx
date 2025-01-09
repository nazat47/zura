"use client";
import React from "react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal";
import CustomModal from "../global/custom-modal";
import UploadMediaForm from "../forms/upload-media";

type Props = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { isOpen, setOpen, setClose } = useModal();
  return (
    <Button
      onClick={() =>
        setOpen(
          <CustomModal
            title="Upload Media"
            subheading="Upload a file to your bucket"
          >
            <UploadMediaForm subaccountId={subaccountId} />
          </CustomModal>
        )
      }
    >
      Upload
    </Button>
  );
};

export default MediaUploadButton;
