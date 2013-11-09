module Handler.AddTransaction where

import Import
import Yesod.Auth (requireAuthId)
import Data.Maybe (fromJust)

postAddTransactionR :: Handler Value
postAddTransactionR = do
    logged_in <- requireAuthId
    (PartialTransaction item description min_offer img) <- runInputPost $ PartialTransaction
        <$> ireq textField "Item" 
        <*> ireq textField "Description" 
        <*> ireq textField "Minimum Offer" 
        <*> iopt textField "Image URL" 
    tId <- runDB $ insert (Transaction logged_in Nothing item  description min_offer Nothing img)
    return $ object [ "transaction_id" .= tId ]

data PartialTransaction = PartialTransaction Text Text Text (Maybe Text)

