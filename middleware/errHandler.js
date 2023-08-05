// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.log(err);

  if (err.name === "ErrorNotFound") {
    res.status(404).json({ message: "Error Not Found" });
  } else if (err.name === "Unauthenticated") {
    res.status(401).json({ message: "Unauthenticated" });
  } else if (err.name === "Unauthorized") {
    res.status(401).json({ message: "Unauthorized" });
  } else if (err.name === "InvalidCred") {
    res.status(401).json({ message: "Invalid Credentials" });
  } else {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = errorHandler;
