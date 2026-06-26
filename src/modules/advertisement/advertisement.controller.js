import AdvertisementModel from "../../models/advertisement.model.js";
import ApiError from "../../utils/ApiErrorHandler.js";
import ApiResponse from "../../utils/ApiRespinseHandler.js";
import AsyncHandler from "../../utils/AsyncHandler.js";
import path from 'path'


export const createAdvertisement = AsyncHandler(async (req, res) => {
    const { addsName, redirectUrl } = req.body;

    if (!addsName) {
        throw new ApiError(400, "Advertisement name is required");
    }

    const imageFile = req.files?.addsImage?.[0];
    const videoFile = req.files?.addsVideo?.[0];

    const advertisement = await AdvertisementModel.create({
        addsName,
        redirectUrl,
        addsImage: imageFile
            ? [
                  {
                      url: `uploads/${path.basename(imageFile.path)}`
                  }
              ]
            : [],
        addsVideo: videoFile
            ? [
                  {
                      url: `uploads/${path.basename(videoFile.path)}`
                  }
              ]
            : []
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            "Advertisement created successfully",
            advertisement
        )
    );
});

export const updateAdvertisement = AsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { addsName, redirectUrl } = req.body;

    if (!id) {
        throw new ApiError(400, "Advertisement id is required");
    }

    const advertisement = await AdvertisementModel.findById(id);

    if (!advertisement) {
        throw new ApiError(404, "Advertisement not found");
    }

    advertisement.addsName = addsName ?? advertisement.addsName;
    advertisement.redirectUrl = redirectUrl ?? advertisement.redirectUrl;

    const imageFile = req.files?.addsImage?.[0];
    const videoFile = req.files?.addsVideo?.[0];

    if (imageFile) {
        advertisement.addsImage = [
            {
                url: `uploads/${path.basename(imageFile.path)}`
            }
        ];
    }

    if (videoFile) {
        advertisement.addsVideo = [
            {
                url: `uploads/${path.basename(videoFile.path)}`
            }
        ];
    }

    await advertisement.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            "Advertisement updated successfully",
            advertisement
        )
    );
});

export const getAdvertisements = AsyncHandler(async (req, res) => {

    const advertisements = await AdvertisementModel.find().sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Advertisements fetched successfully", advertisements)
    );
});

