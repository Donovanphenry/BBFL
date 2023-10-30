import { SupabaseClient } from "@supabase/supabase-js";

function verifyRegisterInputs(formDetails) {
  let hasErrors = false;
  let errors = { email: "", password: "", confirm: "" };

  // Check password length
  if (formDetails.password.length < 6) {
    hasErrors = true;
    errors.password = "Password must be at least 6 characters";
  }
  // Check if passwords match
  if (formDetails.password !== formDetails.confirm) {
    hasErrors = true;
    errors.confirm = "Passwords do not match";
  }
  // Check if email is valid
  if (!formDetails.email.includes("@")) {
    hasErrors = true;
    errors.email = "Invalid email";
  }
  // Check if any fields are empty
  Object.entries(formDetails).forEach(([key, value]) => {
    if (value === "") {
      hasErrors = true;
      errors[key] = "Required";
    }
  });

  if (hasErrors) return errors;
  return undefined;
}

export async function requestRegister(
  formDetails,
  supabase,
) {
  // Check if inputs are valid
  let formErrors = verifyRegisterInputs(formDetails);
  if (formErrors) return formErrors;

  // Send request to supabase
  const { data, error } = await supabase.auth.signUp({
    email: formDetails.email,
    password: formDetails.password,
  });
  // Check for api errors
  if (error) {
    // console.log(error);
    formErrors.email = "Internal error";
    return formErrors;
  }

  // Account created, needs email verification
  return undefined;
}
