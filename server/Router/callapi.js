const express = require("express");
const router = express.Router();

const request = require('request');
const uuidAPIKey = require('uuid-apikey');

// 보안성을 위해서 secretkey가 저장된 파일을 따로 두고 사용.
require("dotenv").config();



router.post("/call", (req, res) => {
    const { apiKey, uuid, numOfRows, pageNo } = req.body;

    if (!uuidAPIKey.isAPIKey(apiKey) || !uuidAPIKey.check(apiKey, uuid)) {
        res.json({ SystemMassage: "API KEY가 유효하지 않습니다." })
    }
    else {
        // 발급받은 인증키를 저장한 env 파일에서 인증키를 가져온다.
        // const serviceKey = process.env.PUBLIC_API_CALLKEY;

        // var url = "http://apis.data.go.kr/B552584/UlfptcaAlarmInqireSvc/getUlfptcaAlarmInfo";
        // var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + serviceKey; /* Service Key*/
        // queryParams += '&' + encodeURIComponent('returnType') + '=' + encodeURIComponent('json'); /* */
        // queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('100'); /* */
        // queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
        // queryParams += '&' + encodeURIComponent('year') + '=' + encodeURIComponent('2020'); /* */
        // queryParams += '&' + encodeURIComponent('itemCode') + '=' + encodeURIComponent('PM10'); /* */

        // const api_url = url + queryParams;

        // request(api_url, function(error, res, body){
        //     if(error){
        //         console.log(error)
        //     }
        //     let info = JSON.parse(body);

        //     console.log(JSON.parse(body))

        //     for (i in info.response.body.items.item) {
        //         console.log('지역 : ' + info.response.body.items.item.districtName);
        //         console.log('지역상세 : ' + info.response.body.items.item.moveName);
        //         console.log('경보수준 : ' + info.response.body.items.item.issueGbn);
        //         console.log('오염수치 : ' + info.response.body.items.item.clearVal);
        //         console.log(" ")
        //     }
        // });

        // 1차 인증서 문제를 해결하기 위해, 본 프로젝트에서는 인증서 보안 설정을 꺼둠.
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

        var options = {
            'method': 'GET',
            'url': `https://apis.data.go.kr/B552584/UlfptcaAlarmInqireSvc/getUlfptcaAlarmInfo?serviceKey=z7ImRcb%2BDxJrHffyg9qkxVkYQgzL8EyntQLQds6ahlEhx4Jo10F1luSE4gBwkvxI3JWbQqINDilLifoBhUJVDQ%3D%3D&returnType=json&numOfRows=${numOfRows}&pageNo=${pageNo}&year=2020&itemCode=PM10`,
            'headers': {
                'Cookie': 'JSESSIONID=AiSnOQjLVerd3nro1L45nXu6zlhIp3nT75enpgry5dSSPyA9b7LGl2oh7SOdTTLA.openapiwas1_servlet_engine1; WMONID=Z5r9Rq6-Xsh'
            }
        };

        request(options, function (error, response) {
            if (error) {
                throw new Error(error);
            }

            // res.json({ datas: response.body });
            res.json({ datas: JSON.parse(response.body) });
        });
    }
})



module.exports = router;