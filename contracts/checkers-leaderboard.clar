;; ============================================================
;; Checkers Leaderboard v2
;; ============================================================
;; Tracks player stats, ratings, win streaks, and achievements.
;; ============================================================

;; Error constants
(define-constant err-not-authorized    (err u100))
(define-constant err-already-registered (err u101))
(define-constant err-not-registered    (err u102))

;; Achievement IDs
(define-constant achievement-first-win    u1)
(define-constant achievement-five-wins    u2)
(define-constant achievement-ten-wins     u3)
(define-constant achievement-streak-three u4)
(define-constant achievement-streak-five  u5)
(define-constant achievement-centurion    u6)  ;; 100 games played

;; Data Maps
(define-map player-stats
  principal
  {
    games-played:  uint,
    wins:          uint,
    losses:        uint,
    draws:         uint,
    rating:        uint,
    win-streak:    uint,
    best-streak:   uint,
    total-captures: uint
  }
)

(define-map player-achievements
  { player: principal, achievement-id: uint }
  bool
)

(define-map authorized-callers
  principal
  bool
)

(define-map player-username
  principal
  (string-ascii 32)
)

;; Variables
(define-data-var contract-owner principal tx-sender)
(define-data-var total-players uint u0)
(define-data-var total-games-recorded uint u0)

;; ============================================================
;; Private helpers
;; ============================================================

(define-private (is-owner)
  (is-eq tx-sender (var-get contract-owner))
)

(define-private (is-authorized)
  (or (is-owner) (default-to false (map-get? authorized-callers contract-caller)))
)

(define-private (award-achievement (player principal) (achievement-id uint))
  (map-set player-achievements { player: player, achievement-id: achievement-id } true)
)

(define-private (check-and-award-achievements (player principal) (stats {
  games-played: uint, wins: uint, losses: uint, draws: uint,
  rating: uint, win-streak: uint, best-streak: uint, total-captures: uint
}))
  (begin
    (if (is-eq (get wins stats) u1)
      (award-achievement player achievement-first-win)
      true
    )
    (if (is-eq (get wins stats) u5)
      (award-achievement player achievement-five-wins)
      true
    )
    (if (is-eq (get wins stats) u10)
      (award-achievement player achievement-ten-wins)
      true
    )
    (if (is-eq (get win-streak stats) u3)
      (award-achievement player achievement-streak-three)
      true
    )
    (if (is-eq (get win-streak stats) u5)
      (award-achievement player achievement-streak-five)
      true
    )
    (if (is-eq (get games-played stats) u100)
      (award-achievement player achievement-centurion)
      true
    )
    true
  )
)

;; ============================================================
;; Public functions
;; ============================================================

(define-public (set-authorized-caller (caller principal) (authorized bool))
  (begin
    (asserts! (is-owner) err-not-authorized)
    (ok (map-set authorized-callers caller authorized))
  )
)

(define-public (register-player)
  (let ((stats (map-get? player-stats tx-sender)))
    (asserts! (is-none stats) err-already-registered)
    (var-set total-players (+ (var-get total-players) u1))
    (ok (map-set player-stats tx-sender {
      games-played:   u0,
      wins:           u0,
      losses:         u0,
      draws:          u0,
      rating:         u1200,
      win-streak:     u0,
      best-streak:    u0,
      total-captures: u0
    }))
  )
)

(define-public (set-username (username (string-ascii 32)))
  (begin
    (map-set player-username tx-sender username)
    (ok true)
  )
)

(define-public (record-match (winner principal) (loser principal))
  (let (
    (winner-stats (default-to
      { games-played: u0, wins: u0, losses: u0, draws: u0, rating: u1200, win-streak: u0, best-streak: u0, total-captures: u0 }
      (map-get? player-stats winner)))
    (loser-stats (default-to
      { games-played: u0, wins: u0, losses: u0, draws: u0, rating: u1200, win-streak: u0, best-streak: u0, total-captures: u0 }
      (map-get? player-stats loser)))
  )
    (asserts! (is-authorized) err-not-authorized)
    (let (
      (new-winner-streak (+ (get win-streak winner-stats) u1))
      (new-winner-best   (if (> new-winner-streak (get best-streak winner-stats))
                           new-winner-streak
                           (get best-streak winner-stats)))
      (updated-winner {
        games-played:   (+ (get games-played winner-stats) u1),
        wins:           (+ (get wins winner-stats) u1),
        losses:         (get losses winner-stats),
        draws:          (get draws winner-stats),
        rating:         (+ (get rating winner-stats) u25),
        win-streak:     new-winner-streak,
        best-streak:    new-winner-best,
        total-captures: (get total-captures winner-stats)
      })
      (updated-loser {
        games-played:   (+ (get games-played loser-stats) u1),
        wins:           (get wins loser-stats),
        losses:         (+ (get losses loser-stats) u1),
        draws:          (get draws loser-stats),
        rating:         (if (> (get rating loser-stats) u25) (- (get rating loser-stats) u25) u0),
        win-streak:     u0,
        best-streak:    (get best-streak loser-stats),
        total-captures: (get total-captures loser-stats)
      })
    )
      (map-set player-stats winner updated-winner)
      (map-set player-stats loser updated-loser)
      (check-and-award-achievements winner updated-winner)
      (var-set total-games-recorded (+ (var-get total-games-recorded) u1))
      (ok true)
    )
  )
)

(define-public (record-draw (player1 principal) (player2 principal))
  (let (
    (p1-stats (default-to
      { games-played: u0, wins: u0, losses: u0, draws: u0, rating: u1200, win-streak: u0, best-streak: u0, total-captures: u0 }
      (map-get? player-stats player1)))
    (p2-stats (default-to
      { games-played: u0, wins: u0, losses: u0, draws: u0, rating: u1200, win-streak: u0, best-streak: u0, total-captures: u0 }
      (map-get? player-stats player2)))
  )
    (asserts! (is-authorized) err-not-authorized)
    (map-set player-stats player1 (merge p1-stats {
      games-played: (+ (get games-played p1-stats) u1),
      draws:        (+ (get draws p1-stats) u1),
      win-streak:   u0
    }))
    (map-set player-stats player2 (merge p2-stats {
      games-played: (+ (get games-played p2-stats) u1),
      draws:        (+ (get draws p2-stats) u1),
      win-streak:   u0
    }))
    (var-set total-games-recorded (+ (var-get total-games-recorded) u1))
    (ok true)
  )
)

;; ============================================================
;; Read-only functions
;; ============================================================

(define-read-only (get-player-stats (player principal))
  (map-get? player-stats player)
)

(define-read-only (get-rating (player principal))
  (match (map-get? player-stats player)
    stats (get rating stats)
    u0
  )
)

(define-read-only (get-win-streak (player principal))
  (match (map-get? player-stats player)
    stats (get win-streak stats)
    u0
  )
)

(define-read-only (has-achievement (player principal) (achievement-id uint))
  (default-to false (map-get? player-achievements { player: player, achievement-id: achievement-id }))
)

(define-read-only (get-username (player principal))
  (map-get? player-username player)
)

(define-read-only (get-total-players)
  (var-get total-players)
)

(define-read-only (get-total-games-recorded)
  (var-get total-games-recorded)
)
