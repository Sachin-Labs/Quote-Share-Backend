import validator from "validator";

export const validateOTP = (req) => {
  const { emailId } = req.body;
  if (!emailId) {
    throw new Error("Email Id is Required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid EmailId");
  }
};

export const isValidGmail = (emailId) => {
  return (
    typeof emailId === "string" &&
    emailId.toLowerCase().endsWith("@gmail.com")
  );
};

export const validateSignup = (req) => {
  const { emailId, name, password } = req.body;
  if (!emailId || !name || !password) {
    throw new Error("All fields Required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid EmailId");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Enter Strong Password");
  }
};

export const validateSignIn = (req) => {
  const { emailId, password } = req.body;
  if (!emailId || !password) {
    throw new Error("All fields are required");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Enter valid EmailId");
  }
};
