import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- 設定エリア：A8.netで取得した自分のリンクをここに貼る ---
const AD_URLS = {
'楽天ペイ等': 'https://www.rakuten-card.co.jp/',
'三井住友NL': 'https://www.smbc-card.com/',
'J-Coin': 'https://j-coin.jp/',
'default': 'https://www.google.com'
};

export default function App() {
const [price, setPrice] = useState('10000');
const [cards, setCards] = useState([
{ id: 1, name: 'PayPay等', rate: '0.5', limit: '' },
{ id: 2, name: '楽天ペイ等', rate: '1.5', limit: '' },
{ id: 3, name: 'd払い等', rate: '0.5', limit: '' },
{ id: 4, name: '三井住友NL', rate: '7.0', limit: '1000' },
{ id: 5, name: 'J-Coin', rate: '10.0', limit: '500' },
{ id: 6, name: '案6', rate: '0.0', limit: '' },
]);

// 【保存機能】アプリ起動時にデータを読み込む
useEffect(() => {
const loadData = async () => {
try {
const saved = await AsyncStorage.getItem('@p_checker_data_v1');
if (saved !== null) setCards(JSON.parse(saved));
} catch (e) { console.error("Load error", e); }
};
loadData();
}, []);

// 【保存機能】入力のたびに自動保存
const updateCard = async (id, field, value) => {
const newCards = cards.map(c => c.id === id ? { ...c, [field]: value } : c);
setCards(newCards);
try {
await AsyncStorage.setItem('@p_checker_data_v1', JSON.stringify(newCards));
} catch (e) { console.error("Save error", e); }
};

// ポイント計算ロジック
const calcPt = (p, r, l) => {
const numP = parseFloat(p) || 0;
const numR = parseFloat(r) || 0;
const numL = l === '' ? Infinity : parseFloat(l);
return Math.min(numP * (numR / 100), numL);
};

const results = cards.map(c => calcPt(price, c.rate, c.limit));
const maxPt = Math.max(...results);
const winnerIndex = results.indexOf(maxPt);
const winnerName = maxPt > 0 ? cards[winnerIndex].name : null;

return (
<SafeAreaView style={styles.container}>
<View style={styles.fixedHeader}>
<Text style={styles.headerTitle}>P-Checker PRO</Text>
</View>

<ScrollView contentContainerStyle={styles.scroll}>
{/* 金額入力 */}
<View style={styles.priceSection}>
<Text style={styles.label}>買い物金額</Text>
<View style={styles.priceInputWrapper}>
<TextInput
style={styles.priceInput}
keyboardType="numeric"
value={price}
onChangeText={setPrice}
placeholder="0"
placeholderTextColor="#333"
/>
<Text style={styles.yenText}>円</Text>
</View>
</View>

{/* 動的アフィリエイトボタン */}
{winnerName && (
<TouchableOpacity
style={styles.affiliateBtn}
onPress={() => Linking.openURL(AD_URLS[winnerName] || AD_URLS.default)}
>
<Text style={styles.affiliateBtnText}>
🔥 {winnerName} で最大還元を受ける
</Text>
</TouchableOpacity>
)}

{/* 比較ボード */}
<View style={styles.board}>
{cards.map((card) => {
const pt = calcPt(price, card.rate, card.limit);
const isWinner = pt === maxPt && pt > 0;
return (
<View key={card.id} style={[styles.card, isWinner && styles.winnerCard]}>
<TextInput
style={[styles.cardName, {color: isWinner ? '#000' : '#888'}]}
value={card.name}
onChangeText={(v) => updateCard(card.id, 'name', v)}
/>
<View style={styles.inputArea}>
<View style={styles.inputBox}>
<Text style={[styles.inputLabel, {color: isWinner ? '#333' : '#555'}]}>還元率%</Text>
<TextInput
style={[styles.cardInput, {color: isWinner ? '#000' : '#fff'}]}
value={card.rate}
onChangeText={(v) => updateCard(card.id, 'rate', v)}
keyboardType="numeric"
/>
</View>
<View style={styles.inputBox}>
<Text style={[styles.inputLabel, {color: isWinner ? '#333' : '#555'}]}>上限pt</Text>
<TextInput
style={[styles.cardInput, {color: isWinner ? '#000' : '#fff'}]}
value={card.limit}
onChangeText={(v) => updateCard(card.id, 'limit', v)}
keyboardType="numeric"
placeholder="∞"
/>
</View>
</View>
<View style={[styles.resBox, {backgroundColor: isWinner ? 'rgba(0,0,0,0.1)' : '#000'}]}>
<Text style={[styles.resPt, {color: isWinner ? '#000' : '#CCFF00'}]}>{Math.floor(pt).toLocaleString()}</Text>
<Text style={[styles.resLabel, {color: isWinner ? '#333' : '#666'}]}>pt獲得</Text>
</View>
</View>
);
})}
</View>

{/* 解説・免責事項（法的ガード） */}
<View style={styles.trustSection}>
<Text style={styles.articleTitle}>🤔 なぜ「還元上限」の計算が不可欠なのか</Text>
<Text style={styles.articleText}>
多くのキャンペーンには「付与上限」という罠があります。例えば20%還元でも上限が1,000円なら、5,000円以上の決済では還元率は実質下がります。本ツールは、高額決済で損をしないための必須比較ツールです。
</Text>

<View style={styles.divider} />

<Text style={styles.sectionHeading}>⚠️ 免責事項・ご利用規約</Text>
<Text style={styles.trustText}>
【1. 正確性】本アプリの結果はシミュレーションであり、実際の還元を保証しません。必ず公式サイトを確認してください。{"\n"}{"\n"}
【2. 損害への責任】本アプリの利用により生じた損害（ポイント付与漏れ、計算誤り等）について、運営者は一切の責任を負いません。自己責任で利用してください。{"\n"}{"\n"}
【3. 広告について】本アプリは提携広告を含みます。広告先での取引はユーザーと広告主の間で行われるものです。
</Text>
<Text style={styles.copyright}>© 2026 P-Checker PRO 運営事務局</Text>
</View>
</ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#000' },
fixedHeader: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
headerTitle: { color: '#CCFF00', fontSize: 18, fontWeight: '900', textAlign: 'center', letterSpacing: 2 },
scroll: { paddingBottom: 50 },
priceSection: { backgroundColor: '#111', padding: 25, alignItems: 'center', marginBottom: 10 },
label: { color: '#666', fontSize: 12, marginBottom: 8 },
priceInputWrapper: { flexDirection: 'row', alignItems: 'baseline' },
priceInput: { color: '#fff', fontSize: 42, fontWeight: '900', textAlign: 'center', minWidth: 150 },
yenText: { color: '#fff', fontSize: 20, marginLeft: 8 },
affiliateBtn: { backgroundColor: '#CCFF00', margin: 12, padding: 18, borderRadius: 15, alignItems: 'center' },
affiliateBtnText: { color: '#000', fontWeight: '900', fontSize: 15 },
board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 },
card: { width: '48.5%', backgroundColor: '#111', padding: 12, borderRadius: 18, marginBottom: 12, borderWidth: 1, borderColor: '#222' },
winnerCard: { backgroundColor: '#CCFF00', borderColor: '#CCFF00' },
cardName: { fontSize: 15, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
inputArea: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
inputBox: { width: '45%' },
inputLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
cardInput: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
resBox: { borderRadius: 12, padding: 8, alignItems: 'center' },
resPt: { fontSize: 26, fontWeight: '900' },
resLabel: { fontSize: 10 },
trustSection: { padding: 20, backgroundColor: '#080808', marginTop: 20 },
articleTitle: { color: '#CCFF00', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
articleText: { color: '#999', fontSize: 13, lineHeight: 22, marginBottom: 20 },
sectionHeading: { color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
trustText: { color: '#555', fontSize: 10, lineHeight: 18, textAlign: 'justify' },
divider: { height: 1, backgroundColor: '#222', marginVertical: 20 },
copyright: { textAlign: 'center', color: '#333', fontSize: 10, marginTop: 40 },
});
