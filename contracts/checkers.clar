;; Checkers/Draughts Game Contract
;; Full on-chain checkers game logic

(define-constant err-game-not-found (err u100))
(define-constant err-game-full (err u101))
(define-constant err-not-your-turn (err u102))
(define-constant err-invalid-move (err u103))
(define-constant err-game-over (err u104))

(define-data-var game-nonce uint u0)

(define-map games
  uint
  {
    player1: principal,
    player2: (optional principal),
    current-turn: uint,
    winner: (optional principal),
    is-active: bool
  }
)

;; Board state: position -> piece (u1=p1, u2=p1-king, u3=p2, u4=p2-king, u0=empty)
(define-map board-state
  {game-id: uint, pos: uint}
  uint
)

(define-public (create-game)
  (let ((game-id (var-get game-nonce)))
    (map-set games game-id {
      player1: tx-sender,
      player2: none,
      current-turn: u1,
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
    (piece (unwrap! (map-get? board-state {game-id: game-id, pos: from}) err-invalid-move))
  )
    (asserts! (get is-active game) err-game-over)
    (asserts! (is-valid-turn game-id) err-not-your-turn)
    (asserts! (> piece u0) err-invalid-move)
    (asserts! (is-valid-move game-id from to piece) err-invalid-move)
    
    (map-set board-state {game-id: game-id, pos: to} (maybe-promote piece to))
    (map-set board-state {game-id: game-id, pos: from} u0)
    
    (if (is-capture-move from to)
      (map-set board-state {game-id: game-id, pos: (get-capture-pos from to)} u0)
      true
    )
    
    (map-set games game-id (merge game {current-turn: (if (is-eq (get current-turn game) u1) u2 u1)}))
    (ok true)
  )
)

(define-private (init-board (game-id uint))
  (begin
    (map-set board-state {game-id: game-id, pos: u1} u1)
    (map-set board-state {game-id: game-id, pos: u3} u1)
    (map-set board-state {game-id: game-id, pos: u5} u1)
    (map-set board-state {game-id: game-id, pos: u7} u1)
    (map-set board-state {game-id: game-id, pos: u8} u1)
    (map-set board-state {game-id: game-id, pos: u10} u1)
    (map-set board-state {game-id: game-id, pos: u12} u1)
    (map-set board-state {game-id: game-id, pos: u14} u1)
    (map-set board-state {game-id: game-id, pos: u17} u1)
    (map-set board-state {game-id: game-id, pos: u19} u1)
    (map-set board-state {game-id: game-id, pos: u21} u1)
    (map-set board-state {game-id: game-id, pos: u23} u1)
    
    (map-set board-state {game-id: game-id, pos: u40} u3)
    (map-set board-state {game-id: game-id, pos: u42} u3)
    (map-set board-state {game-id: game-id, pos: u44} u3)
    (map-set board-state {game-id: game-id, pos: u46} u3)
    (map-set board-state {game-id: game-id, pos: u49} u3)
    (map-set board-state {game-id: game-id, pos: u51} u3)
    (map-set board-state {game-id: game-id, pos: u53} u3)
    (map-set board-state {game-id: game-id, pos: u55} u3)
    (map-set board-state {game-id: game-id, pos: u56} u3)
    (map-set board-state {game-id: game-id, pos: u58} u3)
    (map-set board-state {game-id: game-id, pos: u60} u3)
    (map-set board-state {game-id: game-id, pos: u62} u3)
    true
  )
)

(define-private (is-valid-turn (game-id uint))
  (let ((game (unwrap! (map-get? games game-id) false)))
    (if (is-eq (get current-turn game) u1)
      (is-eq tx-sender (get player1 game))
      (is-eq tx-sender (unwrap! (get player2 game) tx-sender))
    )
  )
)

(define-private (is-valid-move (game-id uint) (from uint) (to uint) (piece uint))
  (let ((diff (if (> to from) (- to from) (- from to))))
    (or (is-eq diff u7) (is-eq diff u9) (is-eq diff u14) (is-eq diff u18))
  )
)

(define-private (is-capture-move (from uint) (to uint))
  (let ((diff (if (> to from) (- to from) (- from to))))
    (or (is-eq diff u14) (is-eq diff u18))
  )
)

(define-private (get-capture-pos (from uint) (to uint))
  (/ (+ from to) u2)
)

(define-private (maybe-promote (piece uint) (pos uint))
  (if (or (and (is-eq piece u1) (>= pos u56)) (and (is-eq piece u3) (<= pos u7)))
    (+ piece u1)
    piece
  )
)

(define-read-only (get-game (game-id uint))
  (map-get? games game-id)
)

(define-read-only (get-piece (game-id uint) (pos uint))
  (map-get? board-state {game-id: game-id, pos: pos})
)
