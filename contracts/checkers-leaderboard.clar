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
