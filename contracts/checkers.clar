;; Checkers/Draughts Game Contract
;; Full on-chain checkers game logic

(define-constant err-game-not-found (err u100))
(define-constant err-game-full (err u101))
(define-constant err-not-your-turn (err u102))
(define-constant err-invalid-move (err u103))
(define-constant err-game-over (err u104))
(define-constant err-not-player (err u105))

(define-data-var game-nonce uint u0)

(define-map games
  uint
  {
    player1: principal,
    player2: (optional principal),
    current-turn: principal,
    winner: (optional principal),
    is-active: bool
  }
)

;; Board: pos -> piece (u0=empty, u1=p1, u2=p1-king, u3=p2, u4=p2-king)
(define-map board
  {game-id: uint, pos: uint}
  uint
)

(define-public (create-game)
  (let ((game-id (var-get game-nonce)))
    (map-set games game-id {
      player1: tx-sender,
      player2: none,
      current-turn: tx-sender,
      winner: none,
      is-active: false
    })
    (init-board game-id)
    (var-set game-nonce (+ game-id u1))
    (ok game-id)
  )
)

(define-public (join-game (game-id uint))
  (let ((game (unwrap! (map-get? games game-id) err-game-not-found)))
    (asserts! (is-none (get player2 game)) err-game-full)
    (asserts! (not (is-eq tx-sender (get player1 game))) err-game-full)
    (map-set games game-id (merge game {
      player2: (some tx-sender),
      is-active: true
    }))
    (ok true)
  )
)

(define-public (move (game-id uint) (from uint) (to uint))
  (let (
    (game (unwrap! (map-get? games game-id) err-game-not-found))
    (piece (unwrap! (map-get? board {game-id: game-id, pos: from}) err-invalid-move))
    (target (default-to u0 (map-get? board {game-id: game-id, pos: to})))
  )
    (asserts! (get is-active game) err-game-over)
    (asserts! (is-eq tx-sender (get current-turn game)) err-not-your-turn)
    (asserts! (> piece u0) err-invalid-move)
    (asserts! (is-eq target u0) err-invalid-move)
    (asserts! (owns-piece game piece) err-not-your-turn)
    
    (let ((promoted (promote-if-needed piece to)))
      (map-set board {game-id: game-id, pos: to} promoted)
      (map-set board {game-id: game-id, pos: from} u0)
      
      (if (is-capture from to)
        (map-set board {game-id: game-id, pos: (get-mid from to)} u0)
        true
      )
      
      (map-set games game-id (merge game {
        current-turn: (get-next-player game)
      }))
      (ok true)
    )
  )
)

(define-private (init-board (game-id uint))
  (begin
    (map-set board {game-id: game-id, pos: u1} u1)
    (map-set board {game-id: game-id, pos: u3} u1)
    (map-set board {game-id: game-id, pos: u5} u1)
    (map-set board {game-id: game-id, pos: u7} u1)
    (map-set board {game-id: game-id, pos: u8} u1)
    (map-set board {game-id: game-id, pos: u10} u1)
    (map-set board {game-id: game-id, pos: u12} u1)
    (map-set board {game-id: game-id, pos: u14} u1)
    (map-set board {game-id: game-id, pos: u17} u1)
    (map-set board {game-id: game-id, pos: u19} u1)
    (map-set board {game-id: game-id, pos: u21} u1)
    (map-set board {game-id: game-id, pos: u23} u1)
    
    (map-set board {game-id: game-id, pos: u40} u3)
    (map-set board {game-id: game-id, pos: u42} u3)
    (map-set board {game-id: game-id, pos: u44} u3)
    (map-set board {game-id: game-id, pos: u46} u3)
    (map-set board {game-id: game-id, pos: u49} u3)
    (map-set board {game-id: game-id, pos: u51} u3)
    (map-set board {game-id: game-id, pos: u53} u3)
    (map-set board {game-id: game-id, pos: u55} u3)
    (map-set board {game-id: game-id, pos: u56} u3)
    (map-set board {game-id: game-id, pos: u58} u3)
    (map-set board {game-id: game-id, pos: u60} u3)
    (map-set board {game-id: game-id, pos: u62} u3)
    true
  )
)

(define-private (owns-piece (game {player1: principal, player2: (optional principal), current-turn: principal, winner: (optional principal), is-active: bool}) (piece uint))
  (if (is-eq tx-sender (get player1 game))
    (or (is-eq piece u1) (is-eq piece u2))
    (or (is-eq piece u3) (is-eq piece u4))
  )
)

(define-private (is-capture (from uint) (to uint))
  (let ((diff (if (> to from) (- to from) (- from to))))
    (or (is-eq diff u14) (is-eq diff u18))
  )
)

(define-private (get-mid (from uint) (to uint))
  (/ (+ from to) u2)
)

(define-private (promote-if-needed (piece uint) (pos uint))
  (if (and (is-eq piece u1) (>= pos u56))
    u2
    (if (and (is-eq piece u3) (<= pos u7))
      u4
      piece
    )
  )
)

(define-private (get-next-player (game {player1: principal, player2: (optional principal), current-turn: principal, winner: (optional principal), is-active: bool}))
  (if (is-eq (get current-turn game) (get player1 game))
    (unwrap-panic (get player2 game))
    (get player1 game)
  )
)

(define-read-only (get-game (game-id uint))
  (map-get? games game-id)
)

(define-read-only (get-piece (game-id uint) (pos uint))
  (default-to u0 (map-get? board {game-id: game-id, pos: pos}))
)

(define-read-only (get-board (game-id uint))
  (ok {
    p0: (get-piece game-id u0), p1: (get-piece game-id u1), p2: (get-piece game-id u2), p3: (get-piece game-id u3),
    p4: (get-piece game-id u4), p5: (get-piece game-id u5), p6: (get-piece game-id u6), p7: (get-piece game-id u7),
    p8: (get-piece game-id u8), p9: (get-piece game-id u9), p10: (get-piece game-id u10), p11: (get-piece game-id u11),
    p12: (get-piece game-id u12), p13: (get-piece game-id u13), p14: (get-piece game-id u14), p15: (get-piece game-id u15),
    p16: (get-piece game-id u16), p17: (get-piece game-id u17), p18: (get-piece game-id u18), p19: (get-piece game-id u19),
    p20: (get-piece game-id u20), p21: (get-piece game-id u21), p22: (get-piece game-id u22), p23: (get-piece game-id u23),
    p24: (get-piece game-id u24), p25: (get-piece game-id u25), p26: (get-piece game-id u26), p27: (get-piece game-id u27),
    p28: (get-piece game-id u28), p29: (get-piece game-id u29), p30: (get-piece game-id u30), p31: (get-piece game-id u31),
    p32: (get-piece game-id u32), p33: (get-piece game-id u33), p34: (get-piece game-id u34), p35: (get-piece game-id u35),
    p36: (get-piece game-id u36), p37: (get-piece game-id u37), p38: (get-piece game-id u38), p39: (get-piece game-id u39),
    p40: (get-piece game-id u40), p41: (get-piece game-id u41), p42: (get-piece game-id u42), p43: (get-piece game-id u43),
    p44: (get-piece game-id u44), p45: (get-piece game-id u45), p46: (get-piece game-id u46), p47: (get-piece game-id u47),
    p48: (get-piece game-id u48), p49: (get-piece game-id u49), p50: (get-piece game-id u50), p51: (get-piece game-id u51),
    p52: (get-piece game-id u52), p53: (get-piece game-id u53), p54: (get-piece game-id u54), p55: (get-piece game-id u55),
    p56: (get-piece game-id u56), p57: (get-piece game-id u57), p58: (get-piece game-id u58), p59: (get-piece game-id u59),
    p60: (get-piece game-id u60), p61: (get-piece game-id u61), p62: (get-piece game-id u62), p63: (get-piece game-id u63)
  })
)
