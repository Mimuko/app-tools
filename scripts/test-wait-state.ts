import {
  flagsFromCommentNotation,
  parseCommentNotation,
  parseCommentsNotation,
} from '../app/tools/project-observer/lib/observation/comment-notation';

function assert(label: string, cond: boolean) {
  if (!cond) {
    console.error(`FAIL: ${label}`);
    process.exit(1);
  }
  console.log(`ok: ${label}`);
}

const sample = `要確認：
要件・実現可否確認必要

社内待ち：
デザイン修正待ち

外部待ち：
四季さん発注待ち

次アクション：
発注後、DCさんに依頼`;

const parsed = parseCommentNotation(sample);
assert('要確認を抽出', parsed.needsReview === '要件・実現可否確認必要');
assert('社内待ちを抽出', parsed.waitingInternal === 'デザイン修正待ち');
assert('外部待ちを抽出', parsed.waitingExternal === '四季さん発注待ち');
assert('次アクションを抽出', parsed.nextAction === '発注後、DCさんに依頼');

const userComment = `次アクション：四季さんから発注いただき次第、以下課題にてDCさんにご共有・進行
SHIKI_STATIC_CRH-3587 MTアーカイブ対応 WPでの実装作業`;

const userNotation = parseCommentNotation(userComment);
const userFlags = flagsFromCommentNotation(userNotation, true);
assert('3575系: 次アクションのみ', userFlags.hasNextAction && !userFlags.needsConfirmation);
assert('3575系: 外部待ちは記法なし', !userFlags.externalWait);

const shikiBlock = `外部待ち：
四季さん発注待ち

次アクション：
発注後、DCさんに依頼`;
const shikiFlags = flagsFromCommentNotation(parseCommentNotation(shikiBlock), true);
assert('記法あり外部待ち', shikiFlags.externalWait && !shikiFlags.needsConfirmation);

console.log('\nAll comment-notation checks passed.');
