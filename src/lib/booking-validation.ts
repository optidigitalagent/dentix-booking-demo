export function isPatientBookingDetailsValid(input: {
  name: string;
  phone: string;
  consent: boolean;
}) {
  return (
    input.name.trim().length >= 2 && input.name.trim().length <= 120 &&
    input.phone.replace(/\D/g, "").length >= 10 && input.phone.replace(/\D/g, "").length <= 15 &&
    input.consent
  );
}
