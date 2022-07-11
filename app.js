'use strict';
//ファイルからデータを読み取る部分
//Node.jsの書き方で、ファイルモジュールを呼び出し
const fs = require('fs');
//readlineは、ファイルを一行ずつ読み込むモジュール
const readline = require('readline');
//fsモジュールを使って、csvファイルからstream を生成し、
const rs = fs.createReadStream('./popu-pref.csv');
//生成したストリームをreadlineオブジェクトのinputとして、rlというオブジェクトに設定(1行ずつ読み込み)する
const rl = readline.createInterface({input: rs });
//集計されたデータを格納するための連想配列を定義して置く
const prefectureDataMap = new Map(); //key: 都道府県、value: 集計データのオブジェクト
//このStreamのインターフェースを利用するのが以下
//lineというイベントが発生したら、この無名関数を呼ぶ
rl.on('line', lineString => {
    //ファイルから条件にあったデータを抜き出す処理
    const columns = lineString.split(',');//カンマを境に区切って配列へ
    const year = parseInt(columns[0]);//文字列を整数に変換してる
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    if (year === 2010 || year === 2015) {
        //
        let value = null;
        if (prefectureDataMap.has(prefecture)) {//連想配列に県があるか、あればそこから県を変数に入れる、なければ初期値を入れとく
            value = prefectureDataMap.get(prefecture);
        } else {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        //連想配列へ、選別されたデータを入れる
        prefectureDataMap.set(prefecture, value);
    }
});
//closeイベントは、全ての行を読み終わった際に呼ばれるイベントで、連想配列を表示している
rl.on('close', () => {
    //都道県名をキーにして、データオブジェクトが表示される
    //ここから、変化率を計算する
    for (const [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    //データを変化率ごとに並び替える
    //連想配列prefectureDataMap(key, value)を、
    //普通の配列に変換(keyとvalueの対を配列[]にし、
    //その配列を要素にした配列([], [])に変換)している。
    //その後sort()比較関数で無名関数(アロー関数)を渡してる
    //pair1と2(0都道府県1集計データオブジェクト)が入った配列
    //比較関数で降順に並び替えができる
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    //ここのmap()は連想配列のMAPとは異なるmap関数(配列の要素に関数を適用した値に変える)
    const rankingStrings = rankingArray.map(([key, value]) => {
        return `${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}`;
    });
    console.log(rankingStrings);
});
