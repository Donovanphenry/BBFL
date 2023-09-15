import { SupabaseClient } from "@supabase/supabase-js";

function verifyLoginInputs(formDetails) {
  let hasErrors = false;
  let errors = { email: "", password: "" };

  // Check if email is valid
  if (!formDetails.email.includes("@")) {
    hasErrors = true;
    errors.email = "Invalid email";
  }
  if (formDetails.email === "") {
    hasErrors = true;
    errors.email = "Email cannot be empty";
  }
  if (formDetails.password === "") {
    hasErrors = true;
    errors.password = "Password cannot be empty";
  }

  if (hasErrors) return errors;
  return undefined;
}

export async function requestLogin(
  formDetails,
  supabase,
) {
  // Check if inputs are valid
  let formErrors = verifyLoginInputs(formDetails);
  if (formErrors) return formErrors;

  // Send request to supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: formDetails.email,
    password: formDetails.password,
  });

  // Check for api errors
  if (error) {
    // console.log(error);

    formErrors = { email: "Invalid email or password", password: "Invalid email or password" };
    return [undefined, formErrors];
  }
  return [data, undefined];
}
