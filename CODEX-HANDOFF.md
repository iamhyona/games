# 팡팡이 캐릭터 — Codex 인수인계 (2026-11-01)

## 1. 위치
- 공통 원본: https://github.com/iamhyona/games/blob/main/pang-art.js
- 저장소 `iamhyona/games` · 브랜치 `main` · 경로 `/pang-art.js`
- 공개 주소: https://iamhyona.github.io/games/pang-art.js
- 같은 폴더: `pang-art-next.js`(수정안) · `pang-art-preview.html`(비교) · `pang-art-check.html`(적용 점검) · `archive/`(승인본 보관) · `PANG-ART.md`(요약) · `tools/pang-art-assets-compare.js`(전/후 자산 비교)
- 작업 전 항상 각 저장소 `main` 최신을 받아서 시작. 예전 ZIP·스냅샷으로 덮어쓰지 말 것.

## 2. 공통 코드 사용법
```js
// 게임에서: <script src="../games/pang-art.js"></script> 뒤에
PangArt.pieceSVG(id, mood)   // SVG 문자열. id 1~10, mood '' | 'b'(웃음) | 'o'(놀람) | 'x'(X눈)
PangArt.COL[id]              // [기본, 밝은, 어두운]
PangArt.angrySVG(id, dy)     // 화난 얼굴 (트윈스타 적)
PangArt.recolor(svg, from, to) // 다른 ID 색으로 칠함 (트윈스타 2P 분홍 별)
PangArt.svgURL(svg)          // data: URL
```
ID: 1 빨강 하트 / 2 크림 꽃 / 3 파랑 물방울 / 4 노랑 별 / 5 분홍 육각형 / 6 초록 새싹 / 7 민트 원 / 8 보라 마름모 / 9 회색 방해블록 / 10 레몬 팔각형 (8 보라·10 레몬은 승인 확정, 바꾸지 말 것)

SVG 안 gradient/mask ID(g, m, s, flowerVolume)가 고정이라 DOM에 여러 개 직접 넣으면 충돌 → `<img>`나 canvas Image로 사용.

## 3. 수정 위치 (pang-art.js 줄 번호 기준)
| 무엇 | 위치 |
|---|---|
| 색상 팔레트 | 19행 `COL` (꽃은 44행 `flowerVolume` 전용 그라데이션도 수정) |
| 모양(실루엣) | 22행 `SH` (+ 20~21행 `star`, `hexa`) |
| 윤곽선 두께 / 얼굴 높이 / 광원 위치 | 33행 `SW`, `FY`, `CT` |
| 얼굴·표정 | 35행 `face()` · 트윈스타 화난 얼굴 51행 `ANGRY` |
| 광택·안쪽 음영·흰 반사광·그라데이션 | 42~44행 `rawPieceSVG()` |
| 캐릭터별 시각 크기·위치 보정 | 46행 `OPTICAL` (충돌 판정과 무관) |
| 버전 표시 | 55행 `version` — 수정 시 올릴 것 |

## 4. 게임별 연결과 예외
모든 게임 `index.html`에 아래 로더가 들어 있음(`?pangart=next`면 next 파일 사용):
```html
<script>document.write('<script src="../games/pang-art'+(/[?&]pangart=next(&|$)/.test(location.search)?'-next':'')+'.js"><\/script>')</script>
```
| 게임(저장소) | 연결 방식 / 유지해야 할 예외 |
|---|---|
| 팡야팡야 `pang` | `COL=PangArt.COL`, `pieceSVG→PangArt.pieceSVG`, 10종×4표정 IMG |
| 스위치팡 `switchpang` | **게임ID 9 → 공통 8(보라 마름모)**, **게임ID 8 = 무지개 특수 아이템**(`rainbowSVG`: 공통 7 모양에 무지개 그라데이션). 공통 ID 8과 혼동 금지 |
| 슈팅팡 `shootingpang` | `game.js`가 `PangArt.pieceSVG` 사용. 옛 `characters.js`는 삭제됨 |
| 벽돌깨기 `bricks` | `PPSV` = 꽃(2) + 웃는 얼굴 b1·b3~b8. 공은 공통 7(원) 모양에 난도색 e4·n3·h1·m8로 칠함(`PPBALLSVG`). `ppBallDrawLegacy`는 이미지 로딩 전 대체 렌더러 |
| 트윈스타 `twinstar` | `PPSV` 4=1P 노랑 별, 11=2P 분홍 별(`recolor(4→5)`), e1=마름모 화남(dy 2), e2=하트 화남(dy -1), e3=팔각 보스 화남(dy 0) |
| 한글비 `hangulbi` | `PPSV` 1, 3 (기본 얼굴) |
| 지뢰찾기 `mines` | 팡팡이 스킨 `setFace()`가 난도별 [6,3,10,1,4] 사용, 표정 smile/oh/dead/cool. 클래식 스마일 얼굴은 그대로 |

제외: 구슬팡(fruitpang)·팡팡농장(farm)·팡카트(kart)·페트리스 — 공통 파일 안 씀, 손대지 말 것.

## 5. 작업 절차
1. **수정**: `pang-art-next.js`만 고치고 푸시 (게임 화면 영향 없음)
2. **미리보기(사용자 승인용)**: 
   - 비포·애프터: https://iamhyona.github.io/games/pang-art-preview.html (달라진 칸 빨간 테두리, 스위치팡 무지개·트윈스타·벽돌공·지뢰 난도 포함)
   - 실제 게임: 각 게임 주소 + `?pangart=next` (예: https://iamhyona.github.io/switchpang/?pangart=next)
   - **사용자 승인 전에는 pang-art.js를 바꾸지 말 것**
3. **검증**: https://iamhyona.github.io/games/pang-art-check.html (`?next`로 수정안 점검) — 7개 모두 ✓, 오류 없음이어야 함. 로컬 전/후 비교는 `tools/pang-art-assets-compare.js` 머리 주석 참고
4. **배포**: 승인본을 `archive/pang-art-<버전>.js`로 저장 → `pang-art.js`에 같은 내용 복사 → 푸시. 게임 7개는 수정 불필요
5. **캐시**: GitHub Pages 캐시 최대 약 10분. 공개 주소의 `pang-art.js` 내용(버전 문자열)이 바뀌었는지 확인 후 게임 확인. 즉시 보려면 강력 새로고침
6. **복구**: 디자인만 → `archive/`의 이전 파일을 `pang-art.js`에 복사해 푸시. 통합 구조 전체 → `PANG-ART.md`의 "통합 직전 커밋" 표대로 각 저장소 되돌림(게임 먼저, games 마지막)

## 6. 이번 작업 결과 (디자인 변경 없음, 구조만 통합)
| 저장소 | 최종 커밋 | 확인 |
|---|---|---|
| games | `1d03e12` 공통 파일·preview·안내, `972abbc` archive (+ 이 문서/점검 페이지 커밋) | 공개본 해시 = 승인 v4 |
| pang | `5fc7424` | 그림 자산 40개 이전과 동일 |
| switchpang | `76e0ead` | 동일 · 9→8 마름모 OK · 무지개 OK |
| shootingpang | `7fac342` (+ characters.js 삭제 커밋) | 동일 |
| bricks | `3ac51cb` | 동일 · 공 난도색 4종 OK |
| twinstar | `d8ef689` | 동일 · 1P/2P/적 3종 OK |
| hangulbi | `08a8587` | 동일 |
| mines | `e7b2be6` | 동일 · 난도 5단계×표정 4 OK · 클래식 얼굴 OK |

검증 방법: 이전/이후 코드로 각 게임을 띄워 실제 사용된 SVG 문자열 전체를 비교(전부 글자 단위 동일), 같은 시드·시간으로 시작/플레이 화면(팡팡이·클래식 스킨) 픽셀 비교 — 차이는 애니메이션 타이밍·토글·스크롤바 등 캐릭터 무관 영역뿐. 7개 GitHub Pages 공개본이 커밋 내용과 일치함 확인.

## 7. 남은 문제 / 주의
- 공통 파일 로드 실패 시(네트워크 등) 게임에 캐릭터가 안 나옴 — 예전처럼 게임 안에 사본 없음(의도된 구조).
- `pang-art.js`에 버전 쿼리가 없어서 반영까지 최대 약 10분 지연.
- `pang-art-next.js`는 현재 `pang-art.js`와 같은 내용(수정안 없음).
- 벽돌깨기 `PPSV` 키 순서만 이전과 다름(내용 동일, 동작 영향 없음).
- 이번 배포는 GitHub 웹 업로드로 진행됨. Codex는 일반 git push 사용 가능.
