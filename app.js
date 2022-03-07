'use strict';
//Node.jsのモジュール(fsとreadline(line以外のイベントも存在する))を呼び出して、オブジェクトを作成
const fs = require('fs');
const readline = require('readline');
//csvファイルからファイルの読み込みを行うStreamを作り、
const rs = fs.createReadStream('./popu-pref.csv');
//rl(streamのifを持ってる)にinputしてオブジェクトを作成している
const rl = readline.createInterface({ input: rs, output: {} });
const prefectureDataMap = new Map();//key: 都道府県, value: 集計データのオブジェクト(集計されたデータを格納する連想配列)
//以下は、利用する際のコード
//rlオブジェクトにてlineというイベントが発生したタイミングで、
//lineString(一行の読み込んだ文字列)の内容が
rl.on('line', lineString => {
    //コンソールに出力される
    console.log(lineString);
    
    //added
    //lineString(ファイルの1行)の内容を,という文字列を境に区切って配列に格納e.g. "ab, cde."-->"ab", "cde"
    const columns = lineString.split(',');//文字列を対象にした関数
    //parseInt()-->文字列を整数に変換する関数
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);
    //2010 or 2015の記録のみ抜き出すように分岐させてる
    if (year === 2010 || year === 2015) {
        console.log(year);
        console.log(prefecture);
        console.log(popu);

        //added
        let value = null;
        //連想配列に、既に県(の集計データオブジェクト)があれば(has関数で値があるかどうかture/falseを格納で、trueならifの判定がtrueになる)
        if (prefectureDataMap.has(prefecture)) {
            //取得
            value = prefectureDataMap.get(prefecture);
        } else {//なければ、valueに初期値をいれる
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
        //人口データを連想配列に保存
        prefectureDataMap.set(prefecture, value);
    }
});
//closeイベントは、全ての行を読み込み終わった際に呼び出される
//その時の無名関数の処理で、集計された    Mapのオブジェクトを出力
rl.on('close', () => {
    //added都道府県ごとの変化率を計算する
    //closeイベントの無名関数を実装する--> for-of 構文
    for (const [key, value] of prefectureDataMap) {
        //valueのchangeプロパティに、変化率を代入する
        value.change = value.popu15 / value.popu10;
    }
    //データの並び替え
    //連想配列を、通常の配列に変換している
    //Array普通のを作る.from(ここの配列っぽい型のもの,今回は連想配列const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト)
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    console.log(rankingArray);
    //連想配列のMap関数とは別のmap関数-->配列.map(関数)で、rankingArray配列のindexと値という要素それぞれに、関数を適用して新たな配列を作りだす
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key + ":" + value.popu10 + "=>" + value.popu15 + "変化率: " + value.change
            //'${key}: ${value.popu10}=>${value.popu15} 変化率: ${value.change}'
        );
    });
    console.log(rankingStrings);
});