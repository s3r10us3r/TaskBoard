const COOKIE_EXPIRATION_TIME = 12 //cookie expiration time in hours

function setCookie(name, value) {
    const date = new Date();
    date.setTime(date.getTime() + COOKIE_EXPIRATION_TIME * 60 * 60 * 1000);
    const expirationDate = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expirationDate + ";path=/";
}

function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        cookie = cookie.trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }

    return "";
}

function deleteCookie(cookieName) {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export {setCookie, getCookie, deleteCookie};