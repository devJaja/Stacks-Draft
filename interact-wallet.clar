;; Interaction 1: Create game
(print "1. Create game")
(print (contract-call? .checkers create-game))

;; Interaction 2: Get game 0
(print "2. Get game 0")
(print (contract-call? .checkers get-game u0))

;; Interaction 3: Get board
(print "3. Get board")
(print (contract-call? .checkers get-board u0))

;; Interaction 4-8: Check pieces
(print "4. Piece at 1")
(print (contract-call? .checkers get-piece u0 u1))

(print "5. Piece at 3")
(print (contract-call? .checkers get-piece u0 u3))

(print "6. Piece at 21")
(print (contract-call? .checkers get-piece u0 u21))

(print "7. Piece at 40")
(print (contract-call? .checkers get-piece u0 u40))

(print "8. Piece at 56")
(print (contract-call? .checkers get-piece u0 u56))

;; Interaction 9: Join game as player 2
(print "9. Join game")
(print (as-contract (contract-call? .checkers join-game u0)))

;; Interaction 10: Move piece
(print "10. Move 21->28")
(print (contract-call? .checkers move u0 u21 u28))

;; Interaction 11: Check moved piece
(print "11. Piece at 28")
(print (contract-call? .checkers get-piece u0 u28))

;; Interaction 12: Get final state
(print "12. Final game state")
(print (contract-call? .checkers get-game u0))
