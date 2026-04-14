;; Test full game flow
(print "=== Starting Game ===")

;; 1. Create game
(print "1. Create game")
(print (contract-call? .checkers create-game))

;; 2. Join as player 2
(print "2. Join game")
(print (as-contract (contract-call? .checkers join-game u0)))

;; 3. Check game state
(print "3. Game state")
(print (contract-call? .checkers get-game u0))

;; 4. Check pieces
(print "4. Piece at 1")
(print (contract-call? .checkers get-piece u0 u1))

(print "5. Piece at 21")
(print (contract-call? .checkers get-piece u0 u21))

(print "6. Piece at 40")
(print (contract-call? .checkers get-piece u0 u40))

;; 7. Make move
(print "7. Move 21->28")
(print (contract-call? .checkers move u0 u21 u28))

;; 8. Check moved piece
(print "8. Piece at 28")
(print (contract-call? .checkers get-piece u0 u28))

;; 9. Player 2 move
(print "9. Player 2 move 42->35")
(print (as-contract (contract-call? .checkers move u0 u42 u35)))

;; 10. Check player 2 piece
(print "10. Piece at 35")
(print (contract-call? .checkers get-piece u0 u35))

;; 11. Get final game state
(print "11. Final game state")
(print (contract-call? .checkers get-game u0))

;; 12. Get board
(print "12. Full board")
(print (contract-call? .checkers get-board u0))
