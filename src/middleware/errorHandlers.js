export const notFound = (req, res, next) => {
  res.sendStatus(404);
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);
  res.sendStatus(500);
};
