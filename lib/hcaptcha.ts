export const verifyHCaptcha = async (captcha) => {
  try {
    const response = await fetch(`https://hcaptcha.com/siteverify`, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
      body: `response=${captcha}&secret=${process.env.HCAPTCHA_SECRET}`,
      method: "POST",
    });
    const captchaValidation = await response.json();
    return captchaValidation;
  } catch {
    return false;
  }
};
