import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
    {
        addsName: {
            type: String,
            required: true,
            trim: true,
        },

        redirectUrl: {
            type: String,
            trim: true
        },

        addsImage: [
            {
                url: {
                    type: String,
                },
            },
        ],

        addsVideo: [
            {
                url: {
                    type: String,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const AdvertisementModel = mongoose.model("Advertisement", advertisementSchema);
export default AdvertisementModel