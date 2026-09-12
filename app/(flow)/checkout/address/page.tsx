"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNest } from "@/lib/store";
import type { DeliveryAddress, LocationValue } from "@/lib/types";
import { FlowPage } from "@/components/shell/flow-layout";
import { Button } from "@/components/ui/button";
import { Checkbox, Chip, Field, Input, PhoneInput } from "@/components/ui/form";
import { LocationInput } from "@/components/ui/location-input";
import { useToast } from "@/components/ui/toast";

export default function AddressPage() {
  const router = useRouter();
  const toast = useToast();
  const user = useNest((s) => s.user);
  const cart = useNest((s) => s.cart);
  const addAddress = useNest((s) => s.addAddress);
  const placeOrder = useNest((s) => s.placeOrder);

  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : "");
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState<LocationValue | null>(null);
  const [zipcode, setZipcode] = useState("");
  const [label, setLabel] = useState<"Home" | "Office">("Home");
  const [isDefault, setIsDefault] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const pickLocation = (v: LocationValue | null) => {
    setLocation(v);
    if (v) {
      if (v.country) setCountry(v.country);
      if (v.city) setCity(v.city);
      if (v.zipcode) setZipcode(v.zipcode);
    }
  };

  const save = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = "Enter your full name";
    if (phone.replace(/\D/g, "").length < 6) e.phone = "Enter a valid phone number";
    if (!country.trim()) e.country = "Required";
    if (!city.trim()) e.city = "Required";
    if (!location && !zipcode.trim()) e.location = "Pick a location";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("Please complete the highlighted fields", "error");
      return;
    }
    const address: DeliveryAddress = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      dialCode: dial,
      country: country.trim(),
      city: city.trim(),
      location: location ?? { address: `${city.trim()}, ${country.trim()}`, city: city.trim(), country: country.trim() },
      zipcode: zipcode.trim(),
      label,
      isDefault,
    };
    setBusy(true);
    addAddress(address);
    if (!cart || !cart.lines.length) {
      toast("Address saved", "success");
      router.push("/tickets");
      return;
    }
    const order = placeOrder(address);
    if (!order) {
      setBusy(false);
      toast("Could not place the order", "error");
      return;
    }
    toast("Order placed", "success");
    router.push(`/checkout/success?order=${order.id}`);
  };

  return (
    <FlowPage title="Add Delivery Address" backHref={cart ? `/events/${cart.eventId}/checkout` : "/dashboard"} width="sm">
      <div className="flex flex-col gap-5">
        <Field label="Full Name" error={errors.fullName}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter" invalid={!!errors.fullName} />
        </Field>
        <Field label="Number" error={errors.phone}>
          <PhoneInput value={phone} onChange={setPhone} dial={dial} onDialChange={setDial} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Country" error={errors.country}>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" invalid={!!errors.country} />
          </Field>
          <Field label="City" error={errors.city}>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" invalid={!!errors.city} />
          </Field>
        </div>
        <Field label="Location" error={errors.location}>
          <LocationInput value={location} onChange={pickLocation} placeholder="Enter Location" />
        </Field>
        <Field label="Zipcode">
          <Input value={zipcode} onChange={(e) => setZipcode(e.target.value)} placeholder="Enter" inputMode="numeric" />
        </Field>
        <Field label="Select A Label For Effective Delivery">
          <div className="flex gap-3">
            {(["Home", "Office"] as const).map((l) => (
              <Chip key={l} size="lg" active={label === l} removable onClick={() => setLabel(l)}>
                {l}
              </Chip>
            ))}
          </div>
        </Field>
        <Checkbox checked={isDefault} onChange={setIsDefault} label="Make Default Delivery Address" />
        <Button variant="white" size="lg" block onClick={save} loading={busy} className="mt-3">
          Save
        </Button>
      </div>
    </FlowPage>
  );
}
