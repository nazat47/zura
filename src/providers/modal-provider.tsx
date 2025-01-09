"use client";

import { PricesList, TicketDetails } from "@/lib/types";
import { Agency, Contact, Plan, User } from "@prisma/client";
import { createContext, useEffect, useState } from "react";

interface ModalProviderProps {
  children: React.ReactNode;
}

export type ModalData = {
  user?: User;
  agency?: Agency;
  ticket?: TicketDetails[0];
  contact?: Contact;
  plans?: {
    defaultPriceId: Plan;
    plans: PricesList["data"];
  };
};

type ModalContextType = {
  data: ModalData;
  isOpen: boolean;
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => void;
  setClose: () => void;
};

export const ModalContext = createContext<ModalContextType>({
  data: {},
  isOpen: false,
  setOpen: (modal: React.ReactNode, fetchData?: () => Promise<any>) => {},
  setClose: () => {},
});

const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ModalData>({});
  const [showingModal, setShowingModal] = useState<React.ReactNode>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const setOpen = async (
    modal: React.ReactNode,
    fetchData?: () => Promise<any>
  ) => {
    if (modal) {
      if (fetchData) {
        const fetchedData = await fetchData();
        setData({ ...data, ...(fetchedData ? fetchedData : {}) });
      }
    }
    setShowingModal(modal);
    setIsOpen(true);
  };

  const setClose = () => {
    setIsOpen(false);
    setData({});
  };

  if (!isMounted) return;

  return (
    <ModalContext.Provider value={{ isOpen, setClose, setOpen, data }}>
      {children}
      {showingModal}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
