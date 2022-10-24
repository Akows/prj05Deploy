const express = require("express");
const router = express.Router();
const mysql = require("mysql");

// DB에 접속하기 위한 정보들을 mysql 모듈을 이용하여 변수에 담아준다.
const db = mysql.createPool({
    host: 'us-cdbr-east-06.cleardb.net',
    port: '3306',
    user: 'b9c5c815b3d053',
    password: '9e964c55',
    database: 'heroku_746ec78e011cc1d',
});


router.post("/showtodo", (req, res) => {
    const { memberId } = req.body;

    const params = [memberId];

    const sqlQuery = `SELECT * 
                        FROM todolist
                        WHERE TODO_MEMBER = ?
                        ORDER BY TODO_ISIMPORTANT DESC;`;

    db.query(sqlQuery, params, (err, data) => {
        if (!err) {
            res.json({ datas: data });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터 조회에 에러가 발생하였습니다." });
        }
    });
})

router.post("/getpostcount", (req, res) => {
    const { memberId } = req.body;

    const params = [memberId];

    const sqlQuery = `SELECT count(*) as "TODO_COUNT" 
                        FROM todolist
                        WHERE TODO_MEMBER = ?;`;

    db.query(sqlQuery, params, (err, data) => {
        if (!err) {
            res.json({ datas: data });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터 조회에 에러가 발생하였습니다." });
        }
    });
})

router.post("/todoinsert", (req, res) => {
    const { memberId, insertText } = req.body;

    const params = [memberId, insertText];

    const sqlQuery = `INSERT INTO todolist(TODO_MEMBER, TODO_TEXT, TODO_ISCHECKED, TODO_ISIMPORTANT, TODO_WRITETIME)
                        VALUES (?, ?, false, false, sysdate());`;

    db.query(sqlQuery, params, (err) => {
        if (err) {
            res.json({ SystemMassage: "TODO 데이터 저장에 에러가 발생하였습니다." });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터가 정상적으로 저장되었습니다."});
        }
    });
})

router.put("/check", (req, res) => {
    const { todonumber, isck } = req.body;
    const params = [isck, isck, todonumber];

    const sqlQuery = `UPDATE todolist
                        SET TODO_ISCHECKED = 
                        CASE 
                        WHEN ? = true THEN false 
                        WHEN ? = false THEN true 
                        ELSE TODO_ISCHECKED
                        END
                        WHERE TODO_NUMBER = ?;`;

    db.query(sqlQuery, params, (err) => {
        if (err) {
            res.json({ SystemMassage: "TODO 데이터 수정에 에러가 발생하였습니다." });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터가 정상적으로 수정되었습니다."});
        }
    });
})

router.put("/important", (req, res) => {
    const { todonumber, isip } = req.body;
    const params = [isip, isip, todonumber];

    console.log(params);

    const sqlQuery = `UPDATE todolist
                        SET TODO_ISIMPORTANT = 
                        CASE 
                        WHEN ? = true THEN false 
                        WHEN ? = false THEN true 
                        ELSE TODO_ISIMPORTANT
                        END
                        WHERE TODO_NUMBER = ?;`;

    db.query(sqlQuery, params, (err) => {
        if (err) {
            res.json({ SystemMassage: "TODO 데이터 수정에 에러가 발생하였습니다." });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터가 정상적으로 수정되었습니다."});
        }
    });
})

router.delete("/delete", (req, res) => {
    const { todonumber } = req.body;

    const params = [todonumber];

    const sqlQuery = `DELETE 
                        FROM todolist 
                        WHERE TODO_NUMBER = ?;`;

    db.query(sqlQuery, params, (err) => {
        if (err) {
            res.json({ SystemMassage: "TODO 데이터 삭제 에러가 발생하였습니다." });
        }
        else {
            res.json({ SystemMassage: "TODO 데이터가 정상적으로 삭제되었습니다."});
        }
    });
})







// Router를 사용하고 있으므로 사용 코드를 작성해준다.
module.exports = router;
