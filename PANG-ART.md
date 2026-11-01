# 팡팡이 공통 캐릭터 원본 (pang-art.js)

`pang-art.js` 한 파일이 아래 7개 게임의 팡팡이 그림을 그린다.
팡야팡야 · 스위치팡 · 슈팅팡 · 벽돌깨기 · 트윈스타 · 한글비 · 지뢰찾기
(구슬팡·팡팡농장·팡카트·페트리스는 사용하지 않음)

각 게임은 `../games/pang-art.js`를 불러온다. 게임별 규칙(스위치팡 게임ID 9→공통 8 보라 마름모, 게임ID 8 = 무지개 특수 아이템, 지뢰찾기 난도별 [6,3,10,1,4], 벽돌깨기 공 난도색 e4·n3·h1·m8, 트윈스타 1P/2P/적 표정)은 각 게임 안에 그대로 있다.

## 파일
| 파일 | 역할 |
|---|---|
| `pang-art.js` | 현재 배포본 (7개 게임이 사용) |
| `pang-art-next.js` | 수정안. 게임 주소 뒤 `?pangart=next`를 붙이면 이 파일로 열림 |
| `pang-art-preview.html` | 현재 ↔ 수정안 비교 + 7개 게임 미리보기 링크 |
| `archive/` | 승인된 이전 버전 보관 |

## 수정 → 승인 → 배포
1. `pang-art-next.js` 수정 후 푸시 (게임 화면은 바뀌지 않음)
2. `games/pang-art-preview.html`과 각 게임 `?pangart=next`로 확인 → 승인
3. 승인본을 `archive/pang-art-<버전>.js`로 보관하고 `pang-art.js`에 복사해 푸시
4. GitHub Pages 캐시로 최대 약 10분 뒤 반영. 바로 보려면 새로고침

## 되돌리기
- 디자인만: `archive/`의 이전 버전을 `pang-art.js`에 복사해 푸시
- 통합 구조 전체: 각 저장소를 아래 통합 직전 커밋으로 되돌림 (게임 먼저, games는 마지막)

| 저장소 | 통합 직전 커밋 (2026-11-01) |
|---|---|
| games | `7efba81` |
| pang | `99492e2` |
| switchpang | `74980d8` |
| shootingpang | `e7304cd` |
| bricks | `ad858c9` |
| twinstar | `39ea707` |
| hangulbi | `037d2c6` |
| mines | `f755939` |
