;; NFT Draft Game Contract
;; Allows players to join drafts, pick NFTs, and manage game state

(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-draft-not-found (err u101))
(define-constant err-already-joined (err u102))
(define-constant err-draft-full (err u103))
(define-constant err-not-your-turn (err u104))
(define-constant err-nft-taken (err u105))
(define-constant err-invalid-pick (err u106))

(define-data-var draft-nonce uint u0)

(define-map drafts
  uint
  {
    max-players: uint,
    entry-fee: uint,
    current-players: uint,
    current-round: uint,
    max-rounds: uint,
    is-active: bool,
    snake-draft: bool
  }
)

(define-map draft-players
  {draft-id: uint, player-index: uint}
  principal
)

(define-map player-draft-index
  {draft-id: uint, player: principal}
  uint
)

(define-map nft-picks
  {draft-id: uint, nft-id: uint}
  principal
)

(define-map player-picks
  {draft-id: uint, player: principal, round: uint}
  uint
)

(define-public (create-draft (max-players uint) (entry-fee uint) (max-rounds uint) (snake-draft bool))
  (let ((draft-id (var-get draft-nonce)))
    (map-set drafts draft-id {
      max-players: max-players,
      entry-fee: entry-fee,
      current-players: u0,
      current-round: u1,
      max-rounds: max-rounds,
      is-active: true,
      snake-draft: snake-draft
    })
    (var-set draft-nonce (+ draft-id u1))
    (ok draft-id)
  )
)

(define-public (join-draft (draft-id uint))
  (let (
    (draft (unwrap! (map-get? drafts draft-id) err-draft-not-found))
    (player-idx (get current-players draft))
  )
    (asserts! (< player-idx (get max-players draft)) err-draft-full)
    (asserts! (is-none (map-get? player-draft-index {draft-id: draft-id, player: tx-sender})) err-already-joined)
    
    (try! (stx-transfer? (get entry-fee draft) tx-sender contract-owner))
    
    (map-set draft-players {draft-id: draft-id, player-index: player-idx} tx-sender)
    (map-set player-draft-index {draft-id: draft-id, player: tx-sender} player-idx)
    (map-set drafts draft-id (merge draft {current-players: (+ player-idx u1)}))
    (ok player-idx)
  )
)

(define-public (pick-nft (draft-id uint) (nft-id uint))
  (let (
    (draft (unwrap! (map-get? drafts draft-id) err-draft-not-found))
    (player-idx (unwrap! (map-get? player-draft-index {draft-id: draft-id, player: tx-sender}) err-not-authorized))
    (current-turn (get-current-turn draft-id))
  )
    (asserts! (get is-active draft) err-draft-not-found)
    (asserts! (is-eq player-idx current-turn) err-not-your-turn)
    (asserts! (is-none (map-get? nft-picks {draft-id: draft-id, nft-id: nft-id})) err-nft-taken)
    
    (map-set nft-picks {draft-id: draft-id, nft-id: nft-id} tx-sender)
    (map-set player-picks {draft-id: draft-id, player: tx-sender, round: (get current-round draft)} nft-id)
    
    (let ((next-draft (advance-turn draft-id)))
      (ok nft-id)
    )
  )
)

(define-private (get-current-turn (draft-id uint))
  (let (
    (draft (unwrap! (map-get? drafts draft-id) u0))
    (round (get current-round draft))
    (max-players (get max-players draft))
    (picks-this-round (mod (- (get-total-picks draft-id) u1) max-players))
  )
    (if (get snake-draft draft)
      (if (is-eq (mod round u2) u1)
        picks-this-round
        (- (- max-players u1) picks-this-round)
      )
      picks-this-round
    )
  )
)

(define-private (get-total-picks (draft-id uint))
  (let ((draft (unwrap! (map-get? drafts draft-id) u0)))
    (* (- (get current-round draft) u1) (get current-players draft))
  )
)

(define-private (advance-turn (draft-id uint))
  (let (
    (draft (unwrap! (map-get? drafts draft-id) draft-id))
    (total-picks (+ (get-total-picks draft-id) u1))
    (picks-per-round (get current-players draft))
  )
    (if (is-eq (mod total-picks picks-per-round) u0)
      (let ((next-round (+ (get current-round draft) u1)))
        (if (> next-round (get max-rounds draft))
          (map-set drafts draft-id (merge draft {is-active: false}))
          (map-set drafts draft-id (merge draft {current-round: next-round}))
        )
      )
      draft-id
    )
    draft-id
  )
)

(define-read-only (get-draft (draft-id uint))
  (map-get? drafts draft-id)
)

(define-read-only (get-player-index (draft-id uint) (player principal))
  (map-get? player-draft-index {draft-id: draft-id, player: player})
)

(define-read-only (get-nft-owner (draft-id uint) (nft-id uint))
  (map-get? nft-picks {draft-id: draft-id, nft-id: nft-id})
)

(define-read-only (get-player-pick (draft-id uint) (player principal) (round uint))
  (map-get? player-picks {draft-id: draft-id, player: player, round: round})
)
