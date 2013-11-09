{-# OPTIONS_GHC -fno-warn-orphans #-}
module Handler.AllUsers where

import Import
import Yesod.Auth (requireAuthId)

$(deriveJSON defaultOptions ''User)

getAllUsersR :: Handler Value
getAllUsersR = do
    users <- runDB $ selectList [] [] :: Handler [Entity User]
    returnJson users

getPossibleReviewsR :: Handler Value
getPossibleReviewsR = do
    logged_in <- requireAuthId
    reviews_made <- runDB $ selectList [ RatingReviewer ==. logged_in ] []
    let already_reviewed = map (ratingReviewed . entityVal) reviews_made
    possible_reviews <- runDB $ selectList [ TransactionClient ==. (Just logged_in), TransactionVendor /<-. already_reviewed  ] []
    let userKeys = map (transactionVendor . entityVal) $ possible_reviews
    users <- runDB $ selectList [ UserId <-. userKeys ] []
    returnJson users

