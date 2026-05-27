import AsyncHandler from "../utils/AsyncHandler";

export const isLoggedIn = AsyncHandler(async(req, res, next) => {
    const { id } = req.user.id;
    
})