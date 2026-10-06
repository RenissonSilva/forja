import { ConfirmOptions, ConfirmSheet } from "@presentation/components/ui/ConfirmSheet";
import React, { createContext, useCallback, useContext, useState } from "react";

type Confirm = (options: ConfirmOptions) => void;

const ConfirmContext = createContext<Confirm>(() => {});

/** Hosts a single ConfirmSheet that any screen opens through `useConfirm`. */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const confirm = useCallback<Confirm>((next) => setOptions(next), []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmSheet options={options} onClose={() => setOptions(null)} />
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  return useContext(ConfirmContext);
}
