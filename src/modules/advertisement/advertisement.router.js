import { Router } from "express";
import { isAdmin, isLoggedIn } from "../../middleware/authMiddleware.js";
import { createAdvertisement, getAdvertisements, updateAdvertisement } from "./advertisement.controller.js";
import upload from "../../middleware/uploadMiddleware.js";


const advertisementFiles = upload.fields([
    { name: "addsImage", maxCount: 10 },
    { name: "addsVideo", maxCount: 5 }
])


const advertisement = Router()
advertisement.route('/')
    .post(isLoggedIn, isAdmin, advertisementFiles, createAdvertisement)
    .get(getAdvertisements);

advertisement.route('/:id')
    .patch(isLoggedIn, isAdmin, advertisementFiles, updateAdvertisement);

export default advertisement
