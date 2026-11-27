"use strict";

const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.urlencoded({ extended: true }));
app.get('/public/keiyo2_add.html', (req, res) => res.redirect('/public/keiyo2_new.html'));
app.use("/public", express.static(__dirname + "/public"));

app.get("/janken", (req, res) => {
  let hand = req.query.hand;
  let win = Number( req.query.win );
  let total = Number( req.query.total );
  console.log( {hand, win, total});
  const num = Math.floor( Math.random() * 3 + 1 );
  let cpu = '';
  let judgement = '';
  if( num==1 ) cpu = 'グー';
  else if( num==2 ) cpu = 'チョキ';
  else cpu = 'パー';
  // ここに勝敗の判定を入れる
  // 以下の数行は人間の勝ちの場合の処理なので，
  // 判定に沿ってあいこと負けの処理を追加する
  judgement = '勝ち';
  win += 1;
  total += 1;
  const display = {
    your: hand,
    cpu: cpu,
    judgement: judgement,
    win: win,
    total: total
  }
  res.render( 'janken', display );
});

// 第7回：元の /janken を残して、ラジオボタン版を追加する。
app.get('/janken2', (req, res) => {
  const hands = ['グー', 'チョキ', 'パー'];
  const your = req.query.hand;
  let win = Number(req.query.win ?? 0);
  let total = Number(req.query.total ?? 0);
  if (!hands.includes(your) || !Number.isSafeInteger(win) ||
      !Number.isSafeInteger(total) || win < 0 || total < win ||
      total >= Number.MAX_SAFE_INTEGER) {
    return res.status(400).render('input_error', {
      message: '手と対戦回数を確認してください。', back: '/public/janken2.html'
    });
  }

  const cpu = hands[Math.floor(Math.random() * 3)];
  let judgement = '負け';
  if (your === cpu) {
    judgement = 'あいこ';
  } else if ((your === 'グー' && cpu === 'チョキ') ||
      (your === 'チョキ' && cpu === 'パー') ||
      (your === 'パー' && cpu === 'グー')) {
    judgement = '勝ち';
    win += 1;
  }
  total += 1;
  res.render('janken2', { your, cpu, judgement, win, total });
});

// 第8回：授業資料の例。追加したデータはサーバ起動中だけ残る。
const station = [
  { id: 1, code: 'JE01', name: '東京駅' },
  { id: 2, code: 'JE07', name: '舞浜駅' },
  { id: 3, code: 'JE12', name: '新習志野駅' },
  { id: 4, code: 'JE13', name: '幕張豊砂駅' },
  { id: 5, code: 'JE14', name: '海浜幕張駅' },
  { id: 6, code: 'JE05', name: '新浦安駅' }
];

function inputText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function stationInput(query) {
  const id = Number(inputText(query.id));
  const code = inputText(query.code);
  const name = inputText(query.name);
  if (!Number.isSafeInteger(id) || id <= 0 || !code || !name) return null;
  return { id, code, name };
}

app.get('/keiyo', (req, res) => {
  const template = req.query.view === 'table' ? 'db2' : 'db1';
  res.render(template, { data: station });
});

app.get('/keiyo_add', (req, res) => {
  const data = stationInput(req.query);
  const back = '/public/keiyo_add.html';
  if (!data || station.some(row => row.id === data.id)) {
    return res.status(400).render('input_error', {
      message: '未使用の正の整数ID、駅コード、駅名を入力してください。', back
    });
  }
  station.push(data);
  if (req.query.after === 'form') return res.redirect(back);
  res.render('db2', { data: station });
});

// 第9回：詳細用の配列。第8回の station とは別に管理する。
const station2 = [
  { id: 1, code: 'JE01', name: '東京駅', change: '総武本線、中央線、ほか', passengers: 403831, distance: 0 },
  { id: 2, code: 'JE02', name: '八丁堀駅', change: '日比谷線', passengers: 31071, distance: 1.2 },
  { id: 3, code: 'JE05', name: '新木場駅', change: '有楽町線、りんかい線', passengers: 67206, distance: 7.4 },
  { id: 4, code: 'JE07', name: '舞浜駅', change: '舞浜リゾートライン', passengers: 76156, distance: 12.7 },
  { id: 5, code: 'JE12', name: '新習志野駅', change: '', passengers: 11655, distance: 28.3 },
  { id: 6, code: 'JE17', name: '千葉みなと駅', change: '千葉都市モノレール', passengers: 16602, distance: 39.0 },
  { id: 7, code: 'JE18', name: '蘇我駅', change: '内房線、外房線', passengers: 31328, distance: 43.0 }
];

function station2Input(fields) {
  const code = inputText(fields.code);
  const name = inputText(fields.name);
  const change = inputText(fields.change);
  const passengerText = inputText(fields.passengers);
  const distanceText = inputText(fields.distance);
  const passengers = Number(passengerText);
  const distance = Number(distanceText);
  if (!code || !name || !passengerText || !Number.isSafeInteger(passengers) ||
      passengers < 0 || !distanceText || !Number.isFinite(distance) || distance < 0) {
    return null;
  }
  return { code, name, change, passengers, distance };
}

function station2Error(res, back) {
  return res.status(400).render('input_error', {
    message: '駅コード、駅名、0以上の乗車人数と距離を入力してください。指定するIDは未使用の正の整数にしてください。',
    back
  });
}

app.get('/keiyo2', (req, res) => {
  res.render('keiyo2', { data: station2 });
});

app.get('/keiyo2/create', (req, res) => {
  res.redirect('/public/keiyo2_new.html');
});

function findStation(req, res, next) {
  const number = Number(req.params.number);
  const station = station2[number];
  if (!/^\d+$/.test(req.params.number) || !station) {
    return res.status(404).render('input_error', {
      message: '指定された駅は見つかりません。', back: '/keiyo2'
    });
  }
  res.locals.number = number;
  res.locals.data = station;
  next();
}

app.get('/keiyo2/:number', findStation, (req, res) => {
  res.render('keiyo2_detail');
});

function addStation(res, fields, autoId) {
  const data = station2Input(fields);
  const givenId = inputText(fields.id);
  let id = Number(givenId);
  if (autoId && !givenId) {
    id = station2.length + 1;
    while (station2.some(row => row?.id === id)) id += 1;
  }
  if (!data || !Number.isSafeInteger(id) || id <= 0 ||
      station2.some(row => row?.id === id)) {
    return station2Error(res, '/keiyo2/create');
  }
  station2.push({ id, ...data });
  res.redirect('/keiyo2');
}

app.post('/keiyo2', (req, res) => addStation(res, req.body, true));
app.get('/keiyo2_add', (req, res) => addStation(res, req.query, false));

app.get('/keiyo2/edit/:number', findStation, (req, res) => {
  res.render('keiyo2_edit');
});

app.post('/keiyo2/update/:number', findStation, (req, res) => {
  const data = station2Input(req.body);
  const { number } = res.locals;
  if (!data) return station2Error(res, '/keiyo2/edit/' + number);
  Object.assign(station2[number], data);
  res.redirect('/keiyo2');
});

app.post('/keiyo2/delete/:number', findStation, (req, res) => {
  // Keep the URLs of the remaining stations valid.
  station2[res.locals.number] = null;
  res.redirect('/keiyo2');
});

// 第8回の自由課題。第9回の詳細表示にも同じ配列を使う。
const pokemon = [
  { number: 1, name: 'フシギダネ', type: 'くさ・どく', category: 'たねポケモン', height: 0.7, weight: 6.9 },
  { number: 2, name: 'フシギソウ', type: 'くさ・どく', category: 'たねポケモン', height: 1.0, weight: 13.0 },
  { number: 3, name: 'フシギバナ', type: 'くさ・どく', category: 'たねポケモン', height: 2.0, weight: 100.0 },
  { number: 4, name: 'ヒトカゲ', type: 'ほのお', category: 'とかげポケモン', height: 0.6, weight: 8.5 },
  { number: 5, name: 'リザード', type: 'ほのお', category: 'かえんポケモン', height: 1.1, weight: 19.0 },
  { number: 6, name: 'リザードン', type: 'ほのお・ひこう', category: 'かえんポケモン', height: 1.7, weight: 90.5 },
  { number: 7, name: 'ゼニガメ', type: 'みず', category: 'かめのこポケモン', height: 0.5, weight: 9.0 },
  { number: 8, name: 'カメール', type: 'みず', category: 'かめポケモン', height: 1.0, weight: 22.5 },
  { number: 9, name: 'カメックス', type: 'みず', category: 'こうらポケモン', height: 1.6, weight: 85.5 }
];

app.get('/pokemon', (req, res) => {
  res.render('pokemon', { data: pokemon });
});

app.get('/pokemon/create', (req, res) => {
  res.redirect('/public/pokemon_add.html');
});

function findPokemon(req, res, next) {
  const number = Number(req.params.number);
  const detail = pokemon.find(row => row.number === number);
  if (!/^\d+$/.test(req.params.number) || !detail) {
    return res.status(404).render('input_error', {
      message: '指定されたポケモンは見つかりません。', back: '/pokemon'
    });
  }
  res.locals.data = detail;
  next();
}

app.get('/pokemon/:number', findPokemon, (req, res) => {
  res.render('pokemon_detail');
});

function pokemonInput(fields) {
  const name = inputText(fields.name);
  const type = inputText(fields.type);
  const category = inputText(fields.category);
  const height = Number(inputText(fields.height));
  const weight = Number(inputText(fields.weight));
  if (!name || !type || !category || !Number.isFinite(height) || height <= 0 ||
      !Number.isFinite(weight) || weight <= 0) return null;
  return { name, type, category, height, weight };
}

function addPokemon(res, fields) {
  const number = Number(inputText(fields.number));
  const data = pokemonInput(fields);
  if (!Number.isSafeInteger(number) || number <= 0 || !data ||
      pokemon.some(row => row.number === number)) {
    return res.status(400).render('input_error', {
      message: '未登録の図鑑番号と、名前・タイプ・分類・正の高さと重さを入力してください。',
      back: '/pokemon/create'
    });
  }
  pokemon.push({ number, ...data });
  res.redirect('/pokemon');
}

app.post('/pokemon', (req, res) => addPokemon(res, req.body));
app.get('/pokemon_add', (req, res) => addPokemon(res, req.query));

app.get('/pokemon/edit/:number', findPokemon, (req, res) => {
  res.render('pokemon_edit');
});

app.post('/pokemon/update/:number', findPokemon, (req, res) => {
  const data = pokemonInput(req.body);
  const detail = res.locals.data;
  if (!data) {
    return res.status(400).render('input_error', {
      message: '名前・タイプ・分類・正の高さと重さを入力してください。',
      back: '/pokemon/edit/' + detail.number
    });
  }
  Object.assign(detail, data);
  res.redirect('/pokemon');
});

app.post('/pokemon/delete/:number', findPokemon, (req, res) => {
  pokemon.splice(pokemon.indexOf(res.locals.data), 1);
  res.redirect('/pokemon');
});

app.get('/', (req, res) => {
  res.redirect('/public/index.html');
});

const port = Number(process.env.PORT || 8080);
app.listen(port, '127.0.0.1', () => console.log('http://127.0.0.1:' + port));
