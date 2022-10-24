// 회원 기능의 서버코드 파일

// 로그인 처리에 대하여.
// 로그인은 어떻게 처리할 것인가?
// 가장 간단한 방법으로는 프론트에서 입력한 ID와 PW를 서버에서 DB와 대조한 다음 localStorage / SessionStorage에 로그인 유지값을 생성하는 방법이 있다.
// 그러나 이 것은 간단하지만 반대로 보안성이 없다시피하다.

// 다음으로는 Cookie를 이용한 방법.
// 쿠키는 브라우저에 저장되는 Key-Value 형태의 데이터이다. 사용자의 컴퓨터에 저장되어 있다가 필요할 때 꺼내서 사용할 수 있는 것.
// 그러나 로그인 정보를 쿠키로만 저장하게 되면, 노출되기 쉬운 브라우저 특징 상 보안성이 여전히 취약할 수 밖에 없다.

// Session.
// 세션은 서버 공간에서 생성되는 저장 공간으로 쿠키 + 세션의 형태로 사용된다.
// 프론트가 쿠키를 서버에 보내면 서버는 이를 검증하여 세션을 생성한 뒤 로그인 정보를 저장하여 프론트로 되돌려보내는 것.
// 보안성면에서 쿠키 단독 사용보다 안전해졌지만 데이터가 오가는 과정이 추가되었기 때문에 처리 속도가 상대적으로 느려진다.

// JWT Json Web Token.
// 세션을 사용했을 때 서버에 가해지는 부하를 방지하기 위해 나온 방법.
// 프론트에서 로그인 요청을 보내면, 서버는 DB와 검증하고 JWT를 생성하여 프론트로 되돌려보내게 된다.
// 세션과 다르게 서버에 저장공간을 사용하지 않아 속도가 상대적으로 빠르다.
// 다만, JWT의 문제는 로그인 상태를 '유지'하는 방법의 구현.
// localStorage / SessionStorage, Cookie, Secure (httpOnly) Cookie 등의 방법이 일반적이지만 위에서 설명했듯이 보안성에 약점을 지니고 있다.
// 100% 완전한 보안은 없지만, 가능한 만큼 안전성을 갖추는 것이 핵심.

// 마찬가지로 express 모듈을 불러와주고, Router를 사용할 것이기 때문에 express의 Router도 불러와준다.
// MariaDB(MySQL)을 사용하고 있으므로 mysql 모듈도 설치하여 불러와준다.
// 로그인에는 JWT를 사용할 것이기 때문에 jsonwebtoken 모듈도 설치하여 불러와준다.
// 또한 암호화 기능을 사용할 것이기 때문에 bcrypt 모듈도 설치하여 불러와준다.
const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const { createTokens, validateToken } = require("../JWT");

// DB에 접속하기 위한 정보들을 mysql 모듈을 이용하여 변수에 담아준다.
const db = mysql.createPool({
    host: 'us-cdbr-east-06.cleardb.net',
    port: '3306',
    user: 'b9c5c815b3d053',
    password: '9e964c55',
    database: 'heroku_746ec78e011cc1d',
});

// json의 사용을 위해서 use 함수를 사용해준다.
router.use(express.json());
// JWT와 Cookie의 동시 사용을 위해서는 json과 같이 use 함수를 사용해주어야한다.
router.use(cookieParser());

// 회원가입 기능
router.post("/register", (req, res) => {
    // 프론트단에서 입력된 아이디와 비밀번호, 이름 및 이메일을 받아와준다.
    const { memberid, memberpw, membername, memberemail } = req.body;

    // 받아온 비밀번호를 암호화한다. 또한 hash가 실행될 숫자를 지정해준다. (높을수록 많이 진행되지만 소모 시간도 길어진다.)
    bcrypt.hash(memberpw, 10)
    // 암호화가 완료될 경우 아래 코드가 실행된다.
    .then((hash) => {
        // 중복 ID 검증 방법
        // Express 서버에서 검증 쿼리를 따로 두어 중복을 방지하거나, DB 테이블을 생성할 때 Unique 속성을 걸어 중복을 방지하는 방법 등이 있다.

        // MariaDB에서 사용할 쿼리문을 작성한다.
        const sqlQuery = `INSERT INTO member(MEMBER_ID, MEMBER_PW, MEMBER_NAME, MEMBER_EMAIL, MEMBER_JOINDATE)
                        VALUES (?, ?, ?, ?, sysdate());`;

        // 쿼리문에 사용될 변수가 많으므로 하나의 배열에 삽입한다. 배열의 순서는 쿼리문에 삽입될 요소의 순서를 맞춘다.
        const params = [memberid, hash, membername, memberemail]

        // 준비된 변수들로 작업을 실행한다.
        db.query(sqlQuery, params, (err) => {
            // 에러가 발생했을 경우 에러 내용을 프론트단으로 전송한다.
            if (err) {
                res.json({ SystemMessage: "DB 통신 에러."})
            }
            // 그렇지 않을 경우 성공 문구를 프론트단으로 전송한다.
            else {
                res.json({ SystemMessage: "회원가입이 완료되었습니다."})
            }
        });
    })
    // 암호화가 에러가 났다면 다음 코드를 실행하고 작업을 종료한다.
    .catch((err) => {
        if (err) {
            res.status(400).json({ SystemMassage: err });
        }
    });
})

// 로그인 기능
router.post("/login", (req, res) => {
    // 프론트단에서 입력된 아이디와 비밀번호를 받아와준다.
    const { memberid, memberpw } = req.body;

    // 로그인 기능이 작동하기 앞서, 사용자가 입력한 ID가 있는 아이디인지 확인해야한다.
    // 우선 ID 검증을 위한 쿼리문을 작성한다.
    const idchecksql = `SELECT *
                        FROM member 
                        WHERE MEMBER_ID = ?`;

    // 쿼리문과 입력한 아이디를 담아 DB로 전송한다.
    db.query(idchecksql, memberid, (err, result) => {
        // 정상적으로 DB와 연결하여 결과를 조회했다면 아래 코드를 실행한다.
        if (!err) {
            // 결과값의 행 길이가 0일 경우 (ID가 존재하지 않음.)
            if (result.length < 1) {
                res.json({ SystemMassage: "존재하지 않는 아이디입니다." });
            }
            // 결과값의 행 길이가 1 이상 경우 (ID가 존재함.)
            else  {
                // 아이디가 존재한다면 이제 로그인 과정으로 넘어가야한다.
                // 다음 순서로는 비밀번호를 검증해야 한다. 우선 ID 검증을 위해 조회한 결과값에서 Password값을 가져온다.
                const dbpwd = result[0].MEMBER_PW;
                // DB에 저장된 비밀번호는 bcrypt에 의해 암호화된 상태로, 단순한 1:1 비교는 불가능하다.
                // 그렇기에 bcrypt에 내장된 대조기능을 사용하여 비밀번호를 검증한다.
                bcrypt.compare(memberpw, dbpwd)
                // 검증이 완료되었을 경우 아래 코드를 실행한다.
                .then((match) => {
                    // 검증이 실패했을 경우 아래 코드를 실행하고 작동을 중지한다.
                    if (!match) {
                        res.json({ SystemMassage: "아이디 혹은 비밀번호가 일치하지 않습니다." });
                    }
                    // 검증이 성공했을 경우 아래 코드를 실행한다.
                    else {
                        // JWT.js에 만들어둔 토큰 생성 함수를 실행한다.
                        const accessToken = createTokens(result[0]);
                        
                        // 생성된 토큰을 cookie에 담아 전송한다.
                        res.cookie("access-token", accessToken, {
                            // cookie의 유효기간 설정.
                            maxAge: 60 * 60 * 24 * 30 * 1000,
                            // 스크립트에 액세스 가능 설정. (허용 안함 (Http만))
                            httpOnly: true,
                        })

                        // 그리고 완료 문구도 전송한다.
                        res.json({ SystemMassage: "로그인 완료!" });
                    }
                })
                // 검증 작업에 에러가 발생했을 경우 아래 코드를 실행하고 작동을 중지한다.
                .catch(() => {
                    res.json({ SystemMassage: "비밀번호 검증작업에서 에러가 발생하였습니다." });
                })
            }
        }
        // 그렇지 않으면 에러 문구를 출력하고 작업을 종료한다.
        else {
            res.json({ SystemMassage: "아이디 중복검사에서 에러가 발생하였습니다." });
        }
    });
})

// 로그아웃 기능
// HttpOnly를 사용하는 JWT의 경우 프론트단에서 Remove가 안된다고 한다.
// 따라서 백엔드단에서 쿠키를 제거하여 로그아웃 기능을 구현하고자 한다.
router.get("/logout", (req, res) => {
    // maxAge를 0으로 맞춰 소멸되도록 하는 방법.
    // 이외에는 Cookie-Parser를 사용하고 있다면, res.clearCookie(name);으로 삭제가 가능하다고 한다.
    res.cookie('access-token', '', {
        maxAge: 0
    });

    // 시스템 메시지를 전송한다.
    res.json({ SystemMassage: "로그아웃 완료!" });
})

// 토큰 유효성 검사 기능
// 본 라우터는 (JWT.js에 구현한) validateToken 함수를 실행한다.
// 유효성이 인증될 경우, 문구를 전송한다.
router.get("/validation", validateToken, () => {
    console.log("JWT 검증완료됨.");
})

// 회원정보조회 기능
router.get("/info", (req, res) => {
    const memberid = req.query.MEMBER_ID;

    const sqlQuery = `SELECT MEMBER_NUMBER, MEMBER_NAME, MEMBER_EMAIL, MEMBER_JOINDATE 
                        FROM member 
                        WHERE MEMBER_ID = ?;`;

    db.query(sqlQuery, memberid, (err, data) => {
        if (!err) {
            res.send(data[0])
        } 
        else {
            res.send(err)
        }
    });    
})

// 회원정보수정 기능
router.put("/infomodify", (req, res) => {
    const mamberNumber = req.query.MEMBER_NUMBER;
    const memberId = req.query.MEMBER_ID;
    const mamberName = req.query.MEMBER_NAME;
    const mamberEmail = req.query.MEMBER_EMAIL;

    const sqlQuery = `UPDATE member 
                        SET MEMBER_ID = ?, MEMBER_NAME = ?, MEMBER_EMAIL = ?
                        WHERE MEMBER_NUMBER = ?;`;

    const params = [memberId, mamberName, mamberEmail, mamberNumber]

    db.query(sqlQuery, params, (err) => {
        if (!err) {
            res.send({ 'SystemMessage': '회원정보가 수정되었습니다.' })
        } 
        else {
            res.send(err)
        }
    });
})

// Router를 사용하고 있으므로 사용 코드를 작성해준다.
module.exports = router;