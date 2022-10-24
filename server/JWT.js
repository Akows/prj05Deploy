// JWT와 관련된 코드가 작성될 파일.

// 보안성을 위해서 secretkey가 저장된 파일을 따로 두고 사용.
require("dotenv").config();

// 토큰 생성 함수, 검증 함수?
const { sign, verify } = require("jsonwebtoken");

// JWT를 생성하는 함수.
// member 정보를 매개변수로 받아 토큰을 생성하여 반환한다.
const createTokens = (data) => {
    // 토큰을 생성, accessToken 변수에 담고 "jwtsecretplschange"의 이름으로 서버에 남겨둔다.
    const ab = process.env.ACCESSTOKEN_SECRET_KEY;

    const accessToken = sign({ memberid: data.MEMBER_ID, memberpw: data.MEMBER_PW }, ab);
    
    // 생성한 토큰을 반환.
    return accessToken;
};

// JWT를 검증하는 함수.
const validateToken = (req, res, next) => {
    // 생성했던 쿠키를 받아 변수에 담는다.
    const accessToken = req.cookies["access-token"];

    // 쿠키가 존재하지 않을 경우, 아래 코드를 실행하고 작동을 종료한다.
    if (!accessToken) 
        return res.status(400).json({ SystemMassage: "유효하지 않은 사용자입니다."});

    // try-catch문, 코드 실행 중 에러가 발생하면 에러 코드문을 실행하고 작동을 종료한다.
    try {
        // Cookie에 담겨있는 토큰과 서버에서 생성했던 토큰을 비교하여 유효성을 검사한다.
        const validToken = verify(accessToken, process.env.ACCESSTOKEN_SECRET_KEY);

        // 토큰이 유효할 경우, authenticated을 true로 바꾸고 함수를 종료한 뒤 이후 코드로 넘어가게 한다. 
        if (validToken) {
            req.authenticated = true;
            res.json({ memberid: validToken.memberid });
            return next();
        }
    }
    // 에러가 발생했을 경우, 아래 코드를 실행하고 작동을 종료한다.
    catch (err) {
        return res.status(400).json({ SystemMassage: "검증에 에러가 발생하였습니다." + err });
    }
};

// 구현한 함수를 사용하기 위해서 exports 해준다.
module.exports = { createTokens, validateToken };