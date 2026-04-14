;; Create game
(contract-call? .checkers create-game)

;; Get game 0
(contract-call? .checkers get-game u0)

;; Get board
(contract-call? .checkers get-board u0)

;; Get pieces
(contract-call? .checkers get-piece u0 u1)
(contract-call? .checkers get-piece u0 u3)
(contract-call? .checkers get-piece u0 u5)
(contract-call? .checkers get-piece u0 u21)
(contract-call? .checkers get-piece u0 u40)
(contract-call? .checkers get-piece u0 u42)
(contract-call? .checkers get-piece u0 u56)
