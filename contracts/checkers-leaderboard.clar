;; checkers-leaderboard.clar
;; Stacks Checkers Leaderboard

;; Error constants
(define-constant err-not-authorized (err u100))
(define-constant err-already-registered (err u101))
(define-constant err-not-registered (err u102))

;; Data Maps
(define-map player-stats
  principal
  {
    games-played: uint,
    wins: uint,
    losses: uint,
    rating: uint
  }
)

(define-map authorized-callers
  principal
  bool
)

;; Variables
(define-data-var contract-owner principal tx-sender)

;; Private functions
(define-private (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

;; Public functions
(define-public (set-authorized-caller (caller principal) (authorized bool))
  (begin
    (asserts! (is-owner) err-not-authorized)
    (ok (map-set authorized-callers caller authorized))
  )
)

(define-public (register-player)
  (let ((stats (map-get? player-stats tx-sender)))
    (asserts! (is-none stats) err-already-registered)
    (ok (map-set player-stats tx-sender {
      games-played: u0,
      wins: u0,
      losses: u0,
      rating: u1200
    }))
  )
)

(define-public (record-match (winner principal) (loser principal))
  (let (
    (caller-authorized (default-to false (map-get? authorized-callers contract-caller)))
    (winner-stats (default-to { games-played: u0, wins: u0, losses: u0, rating: u1200 } (map-get? player-stats winner)))
    (loser-stats (default-to { games-played: u0, wins: u0, losses: u0, rating: u1200 } (map-get? player-stats loser)))
  )
    (asserts! caller-authorized err-not-authorized)
    (map-set player-stats winner {
      games-played: (+ (get games-played winner-stats) u1),
      wins: (+ (get wins winner-stats) u1),
      losses: (get losses winner-stats),
      rating: (+ (get rating winner-stats) u25)
    })
    (map-set player-stats loser {
      games-played: (+ (get games-played loser-stats) u1),
      wins: (get wins loser-stats),
      losses: (+ (get losses loser-stats) u1),
      rating: (if (> (get rating loser-stats) u25) (- (get rating loser-stats) u25) u0)
    })
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-player-stats (player principal))
  (map-get? player-stats player)
)

