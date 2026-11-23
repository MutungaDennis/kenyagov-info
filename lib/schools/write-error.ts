type DatabaseWriteError = {
  code?: string;
  message?: string;
};

export function schoolWriteFailure(error: DatabaseWriteError) {
  if (error.code === "23505" || /slug|url/i.test(error.message ?? "")) {
    return { status: 409, message: "That school URL is already in use. Change the URL and try again." };
  }
  if (error.code === "23514") {
    return { status: 400, message: "One or more school details do not match the allowed options. Review them and try again." };
  }
  if (error.code === "23502") {
    return { status: 400, message: "Complete all required school details and try again." };
  }
  if (error.code === "23503") {
    return { status: 400, message: "A selected county or linked record is no longer valid. Review the location and try again." };
  }
  return { status: 500, message: "The school could not be saved. Try again, and contact support if the problem continues." };
}
