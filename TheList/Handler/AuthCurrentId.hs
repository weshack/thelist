module Handler.AuthCurrentId where

import Import
import Yesod.Auth(maybeAuth)

$(deriveJSON defaultOptions ''User)

getAuthCurrentIdR :: Handler Value
getAuthCurrentIdR = do
    user <- maybeAuth
    case user of
        Just u -> returnJson u
        Nothing -> returnJson [ "result" .= ("not logged in" :: Text) ]
