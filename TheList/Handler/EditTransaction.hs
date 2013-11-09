module Handler.EditTransaction where

import Import
import Data.Maybe (fromJust)
import Yesod.Auth (requireAuthId)

postEditTransactionR :: Handler Value
postEditTransactionR = do
    logged_in <- requireAuthId
    (PartialTransaction tId item description min_offer) <- runInputPost $ PartialTransaction
        <$> ((fromJust . fromPathPiece) <$> ireq textField "Transaction Id")
        <*> ireq textField "Item" 
        <*> ireq textField "Description" 
        <*> ireq textField "Minimum Offer" 
    t <- runDB $ get404 tId
    case ((transactionVendor t) == logged_in) of
        True -> do
            runDB $ update tId [TransactionItem =. item, TransactionBestOffer =. min_offer, TransactionDescription =. description ]
            returnJson $ object [ "result" .= ("ok" :: Text) ]
        False -> returnJson $ object [ "result" .= ("error" :: Text) ]

data PartialTransaction = PartialTransaction TransactionId Text Text Text

