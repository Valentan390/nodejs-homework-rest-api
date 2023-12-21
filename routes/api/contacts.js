import express from "express";

import contactsController from "../../controllers/contacts.js";
import { validateBody, isEmptyBody } from "../../middlewares/validateBody.js";
import isValidId from "../../middlewares/isValidId.js";
import authenticate from "../../middlewares/authenticate.js";
import upload from "../../middlewares/upload.js";

import {
  contactAddSchema,
  contactUpdateSchema,
  contactUpdateFavoriteSchema,
} from "../../models/contact.js";

export const contactsRouter = express.Router();

contactsRouter.use(authenticate);

contactsRouter.get("/", contactsController.getALL);

contactsRouter.get("/:contactId", isValidId, contactsController.getById);

// upload.fields([{name: "poster", maxCount: 1}])
// upload.array("poster", 8)

contactsRouter.post(
  "/",
  upload.single("poster"),
  isEmptyBody,
  validateBody(contactAddSchema),
  contactsController.add
);

contactsRouter.delete("/:contactId", isValidId, contactsController.deleteById);

contactsRouter.put(
  "/:contactId",
  isValidId,
  isEmptyBody,
  validateBody(contactUpdateSchema),
  contactsController.updateById
);

contactsRouter.patch(
  "/:contactId/favorite",
  isValidId,
  isEmptyBody,
  validateBody(contactUpdateFavoriteSchema),
  contactsController.updateById
);
