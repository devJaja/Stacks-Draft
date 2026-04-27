;; ============================================================
;; Checkers / Draughts — On-Chain Game Contract
;; ============================================================
;; A fully on-chain two-player checkers game on Stacks.
;; Supports diagonal moves, captures, king promotion.
;;
;; Piece encoding:
;;   0 = empty, 1 = p1, 2 = p1-king, 3 = p2, 4 = p2-king
;;
;; Board layout: flat index 0..63 mapping to an 8x8 grid.
;; ============================================================

;; ============================================================
;; Error constants
;; ============================================================

(define-constant err-game-not-found (err u100))
(define-constant err-game-full (err u101))
(define-constant err-not-your-turn (err u102))
(define-constant err-invalid-move (err u103))
(define-constant err-game-over (err u104))
(define-constant err-not-player (err u105))
(define-constant err-invalid-position (err u106))

;; ============================================================
;; Piece-type constants
;; ============================================================

(define-constant piece-empty u0)
(define-constant piece-p1 u1)
(define-constant piece-p1-king u2)
(define-constant piece-p2 u3)
(define-constant piece-p2-king u4)

;; ============================================================
;; Board-geometry constants
;; ============================================================

(define-constant board-size u64)
(define-constant promotion-row-p1 u56)
(define-constant promotion-row-p2 u7)
(define-constant step-diff-a u7)
(define-constant step-diff-b u9)
(define-constant capture-diff-a u14)
(define-constant capture-diff-b u18)

;; ============================================================
;; State variables
;; ============================================================

(define-data-var game-nonce uint u0)

;; ============================================================
;; Data maps
;; ============================================================

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

;; ============================================================
;; Public functions
;; ============================================================

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
    (target (default-to piece-empty (map-get? board {game-id: game-id, pos: to})))
  )
    (asserts! (get is-active game) err-game-over)
    (asserts! (is-eq tx-sender (get current-turn game)) err-not-your-turn)
    (asserts! (> piece piece-empty) err-invalid-move)
    (asserts! (is-eq target piece-empty) err-invalid-move)
    (asserts! (owns-piece game piece) err-not-your-turn)
    (asserts! (is-valid-position from) err-invalid-position)
    (asserts! (is-valid-position to) err-invalid-position)
    (asserts! (is-valid-move from to) err-invalid-move)
    
    (let ((promoted (promote-if-needed piece to)))
      (map-set board {game-id: game-id, pos: to} promoted)
      (map-set board {game-id: game-id, pos: from} piece-empty)
      
      (if (is-capture from to)
        (map-set board {game-id: game-id, pos: (get-mid from to)} piece-empty)
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
    (map-set board {game-id: game-id, pos: u1} piece-p1)
    (map-set board {game-id: game-id, pos: u3} piece-p1)
    (map-set board {game-id: game-id, pos: u5} piece-p1)
    (map-set board {game-id: game-id, pos: u7} piece-p1)
    (map-set board {game-id: game-id, pos: u8} piece-p1)
    (map-set board {game-id: game-id, pos: u10} piece-p1)
    (map-set board {game-id: game-id, pos: u12} piece-p1)
    (map-set board {game-id: game-id, pos: u14} piece-p1)
    (map-set board {game-id: game-id, pos: u17} piece-p1)
    (map-set board {game-id: game-id, pos: u19} piece-p1)
    (map-set board {game-id: game-id, pos: u21} piece-p1)
    (map-set board {game-id: game-id, pos: u23} piece-p1)
    
    (map-set board {game-id: game-id, pos: u40} piece-p2)
    (map-set board {game-id: game-id, pos: u42} piece-p2)
    (map-set board {game-id: game-id, pos: u44} piece-p2)
    (map-set board {game-id: game-id, pos: u46} piece-p2)
    (map-set board {game-id: game-id, pos: u49} piece-p2)
    (map-set board {game-id: game-id, pos: u51} piece-p2)
    (map-set board {game-id: game-id, pos: u53} piece-p2)
    (map-set board {game-id: game-id, pos: u55} piece-p2)
    (map-set board {game-id: game-id, pos: u56} piece-p2)
    (map-set board {game-id: game-id, pos: u58} piece-p2)
    (map-set board {game-id: game-id, pos: u60} piece-p2)
    (map-set board {game-id: game-id, pos: u62} piece-p2)
    true
  )
)

;; True if tx-sender owns the given piece type
(define-private (owns-piece (game {player1: principal, player2: (optional principal), current-turn: principal, winner: (optional principal), is-active: bool}) (piece uint))
  (if (is-eq tx-sender (get player1 game))
    (or (is-eq piece piece-p1) (is-eq piece piece-p1-king))
    (or (is-eq piece piece-p2) (is-eq piece piece-p2-king))
  )
)

;; True if the position index is within the 8x8 board
(define-private (is-valid-position (pos uint))
  (< pos board-size)
)

;; True if the move distance is a legal step or capture jump
(define-private (is-valid-move (from uint) (to uint))
  (let ((diff (abs-diff from to)))
    (or
      (is-eq diff step-diff-a)
      (is-eq diff step-diff-b)
      (is-eq diff capture-diff-a)
      (is-eq diff capture-diff-b)
    )
  )
)

;; Returns the absolute difference between two uint values
(define-private (abs-diff (a uint) (b uint))
  (if (> a b) (- a b) (- b a))
)

;; True if the move distance matches a capture/jump span
(define-private (is-capture (from uint) (to uint))
  (let ((diff (abs-diff from to)))
    (or (is-eq diff capture-diff-a) (is-eq diff capture-diff-b))
  )
)

;; Returns the midpoint position between two board squares
(define-private (get-mid (from uint) (to uint))
  (/ (+ from to) u2)
)

;; Promotes a piece to king if it has reached the opposing back rank
(define-private (promote-if-needed (piece uint) (pos uint))
  (if (and (is-eq piece piece-p1) (>= pos promotion-row-p1))
    piece-p1-king
    (if (and (is-eq piece piece-p2) (<= pos promotion-row-p2))
      piece-p2-king
      piece
    )
  )
)

;; True if tx-sender is either player in the game
(define-private (is-participant
  (game {
    player1: principal, player2: (optional principal),
    current-turn: principal, winner: (optional principal), is-active: bool
  }))
  (or
    (is-eq tx-sender (get player1 game))
    (is-eq tx-sender (unwrap-panic (get player2 game)))
  )
)

;; Returns the player whose turn comes next
(define-private (get-next-player (game {player1: principal, player2: (optional principal), current-turn: principal, winner: (optional principal), is-active: bool}))
  (if (is-eq (get current-turn game) (get player1 game))
    (unwrap-panic (get player2 game))
    (get player1 game)
  )
)

;; ============================================================
;; Read-only functions
;; ============================================================

(define-read-only (get-game (game-id uint))
  (map-get? games game-id)
)

(define-read-only (get-piece (game-id uint) (pos uint))
  (default-to piece-empty (map-get? board {game-id: game-id, pos: pos}))
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
