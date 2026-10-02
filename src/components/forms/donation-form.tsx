"use client";

import { Form, Formik } from "formik";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { donationPledgeSchema, type DonationPledgeValues } from "@/lib/validations/donation";
import { submitDonation } from "@/actions/donations";
import { CheckboxField, FormAlert, TextArea, TextField } from "@/components/ui/form-fields";
import { Button } from "@/components/ui/button";
import { actionIcons } from "@/config/icons";
import { formatPeso } from "@/lib/money";

type Item = { id: string; name: string; unitAmount: number };

export const DonationForm = ({
  campaignId,
  items,
  qr,
}: {
  campaignId: string;
  items: Item[];
  qr: { url: string; accountName: string | null } | null;
}) => {
  const [done, setDone] = useState<{ amount: number; message?: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="rounded-2xl bg-leaf-mist p-8 text-leaf">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={36} />
        <h3 className="mt-4 text-2xl font-semibold text-ink">Thank you for giving {formatPeso(done.amount)}</h3>
        <p className="mt-2 text-ink-soft">{done.message}</p>
      </div>
    );
  }

  const initialValues: DonationPledgeValues = {
    campaignId,
    itemId: items[0]?.id ?? "",
    quantity: 1,
    donorName: "",
    donorEmail: "",
    isAnonymous: false,
    referenceNumber: "",
    message: "",
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={toFormikValidationSchema(donationPledgeSchema)}
      onSubmit={async (values, { setErrors }) => {
        setFormError(null);
        const res = await submitDonation(values);
        if (res.ok) setDone({ amount: res.data!.amount, message: res.message });
        else {
          setFormError(res.message);
          if (res.fieldErrors) setErrors(res.fieldErrors);
        }
      }}
    >
      {({ values, setFieldValue, isSubmitting }) => {
        const item = items.find((i) => i.id === values.itemId);
        const qty = Number(values.quantity) || 0;
        const total = item ? item.unitAmount * qty : 0;
        return (
          <Form className="space-y-8" noValidate>
            <fieldset>
              <legend className="font-display text-xl font-semibold">1. Choose what to give</legend>
              <div className="mt-4 grid gap-3">
                {items.map((i) => (
                  <label
                    key={i.id}
                    className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border-2 px-4 py-3.5 ${
                      values.itemId === i.id ? "border-sea bg-sun-mist" : "border-line hover:border-ink/30"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="itemId"
                        value={i.id}
                        checked={values.itemId === i.id}
                        onChange={() => setFieldValue("itemId", i.id)}
                        className="accent-sea"
                      />
                      {i.name}
                    </span>
                    <span className="font-display font-semibold tabular-nums">{formatPeso(i.unitAmount)} each</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-end gap-4">
                <div className="w-32">
                  <TextField name="quantity" label="How many" type="number" min={1} max={1000} inputMode="numeric" />
                </div>
                <p className="pb-2.5 text-lg">
                  Total <strong className="font-display tabular-nums">{formatPeso(total)}</strong>
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display text-xl font-semibold">2. Scan and pay {formatPeso(total)}</legend>
              {qr ? (
                <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="relative size-52 shrink-0 overflow-hidden rounded-xl border border-line bg-white">
                    <Image src={qr.url} alt="QR Ph code for donations" fill sizes="208px" className="object-contain p-2" />
                  </div>
                  <p className="text-ink-soft">
                    Open your bank or e-wallet app, choose <strong className="text-ink">Scan QR</strong>, and enter the
                    total above.
                    {qr.accountName ? (
                      <>
                        {" "}
                        The account name should read <strong className="text-ink">{qr.accountName}</strong>.
                      </>
                    ) : null}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-ink-soft">The QR code for this campaign is being set up. Check back soon.</p>
              )}
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="font-display text-xl font-semibold">3. Tell us about your payment</legend>
              <TextField
                name="referenceNumber"
                label="Reference number"
                hint="Found on your payment receipt in the app."
                autoComplete="off"
              />
              <CheckboxField name="isAnonymous" label="Give anonymously" />
              {!values.isAnonymous ? <TextField name="donorName" label="Your name" autoComplete="name" /> : null}
              <TextField
                name="donorEmail"
                label="Email (optional)"
                type="email"
                autoComplete="email"
                hint="We'll only use this to confirm your donation."
              />
              <TextArea name="message" label="Message for the kids (optional)" rows={3} />
            </fieldset>

            {formError ? <FormAlert tone="error">{formError}</FormAlert> : null}
            <Button type="submit" variant="give" size="lg" icon={actionIcons.send} className="w-full" disabled={isSubmitting || !qr}>
              {isSubmitting ? "Sending…" : "Send donation details"}
            </Button>
          </Form>
        );
      }}
    </Formik>
  );
};
