const express = require("express");
const router = express.Router();

const mysql = require("mysql");

const db = mysql.createPool({
    host: "localhost",
    port: '3308',
    user: "root",
    password: "123456",
    database: "prj05",
});

router.get("/select", (req, res) => {
    const sqlQuery = `SELECT * 
                        FROM prj05.board`;

    db.query(sqlQuery, (error, data) => {
        if (error)
            res.send(error);
        else
            res.send({datas: data});
    })
})

router.post("/write", (req, res) => {

    const inputtitle = req.query.BOARD_TITLE;
    const inputtext = req.query.BOARD_TEXT;
    const inputwriter = req.query.BOARD_WRITER;

    const sqlQuery = `INSERT INTO board(BOARD_TITLE, BOARD_TEXT, BOARD_WRITER, BOARD_WRITE_TIME)
                        VALUES (?, ?, ?, sysdate());`;

    const params = [inputtitle, inputtext, inputwriter]

    db.query(sqlQuery, params, (err, data) => {
        if (!err) {
            res.send({ 'SystemMessage': '글이 작성되었습니다.' })
        } 
        else {
            res.send(err)
        }
    });
})

router.delete("/delete", (req, res) => {
    const deletetarget = req.query.BOARD_NUMBER;

    const sqlQuery = `DELETE 
                        FROM board 
                        WHERE BOARD_NUMBER = ?;`;

    db.query(sqlQuery, deletetarget, (err, data) => {
        if (!err) {
            res.send({ 'SystemMessage': '글이 삭제되었습니다.' })
        } 
        else {
            res.send(err)
        }
    });
})

router.put("/modify", (req, res) => {
    const boardnumber = req.query.BOARD_NUMBER;
    const boardtitle = req.query.BOARD_TITLE;
    const boardtext = req.query.BOARD_TEXT;

    const sqlQuery = `UPDATE board 
                        SET BOARD_TITLE = ? , BOARD_TEXT = ?
                        WHERE BOARD_NUMBER = ?;`;

    const params = [boardtitle, boardtext, boardnumber]

    db.query(sqlQuery, params, (err, data) => {
        if (!err) {
            res.send({ 'SystemMessage': '글이 수정되었습니다.' })
        } 
        else {
            res.send(err)
        }
    });
})

module.exports = router;