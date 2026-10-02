"use client";

import { toastIcons } from "@/config/icons";
import { toast } from "@/stores/toast-store";
import { Button } from "@/components/ui/button";
import { Specimen } from "./showcase";

const burst = ["First", "Second", "Third", "Fourth", "Fifth"];

/** Fires real toasts through the global Toaster in the root layout. */
export const ToastDemo = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <Specimen label="Tones">
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" icon={toastIcons.success} onClick={() => toast.success("Post published.")}>
          Success
        </Button>
        <Button variant="outline" icon={toastIcons.error} onClick={() => toast.error("We couldn't save your changes. Try again.")}>
          Error
        </Button>
        <Button variant="outline" icon={toastIcons.info} onClick={() => toast.info("Your change is waiting for approval.")}>
          Info
        </Button>
      </div>
    </Specimen>
    <Specimen label="Stack limit: fires five, keeps the newest three">
      <Button onClick={() => burst.forEach((nth) => toast.info(`${nth} notification`))}>Fire five at once</Button>
    </Specimen>
  </div>
);
