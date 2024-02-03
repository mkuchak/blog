import { useState } from "react";

/**
 * A hook to control the state of a modal
 * @param onToggle - A callback function to be called when the modal is toggled
 * @returns [isOpen, toggle]
 */
export function useModalController(onToggle?: () => void) {
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Toggles the modal state, if forceState is passed, it will force the modal to open or close
   * @param forceState - "open" | "close"
   */
  const toggle = (forceState?: "open" | "close") => {
    let nextState: boolean;

    if (forceState === "open") nextState = true;
    if (forceState === "close") nextState = false;
    else nextState = !isOpen;

    setIsOpen(nextState);
    onToggle?.();
  };

  return [isOpen, toggle] as const;
}
