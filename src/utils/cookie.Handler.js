export const setAuthCookies = (res, refreshToken) => {
    option = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }

    res.cookie("accessToken", refreshToken, {
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

    res.clearCookie("refreshToken", options);
    // res.clearCookie("refreshToken", options);
};