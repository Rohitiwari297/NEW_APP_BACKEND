export const setAuthCookies = (res, accessToken) => {
    option = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }

    res.cookie("accessToken", accessToken, {
        ...option,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    // Refresh Token here if exists (long life)
}


export const clearAuthCookies = (res) => {
    const isProduction = process.env.NODE_ENV === "production";

    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "strict",
    };

    res.clearCookie("accessToken", options);
    // res.clearCookie("refreshToken", options);
};