module Main exposing (main)

import Browser
import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


main : Program Value Model Msg
main =
    Browser.document
        { init = \_ -> ( {}, Cmd.none )
        , update = \_ model -> ( model, Cmd.none )
        , subscriptions = always Sub.none
        , view = view
        }


type alias Model =
    {}


type Msg
    = Noop


encodeIntl : List ( String, Value ) -> String
encodeIntl pairs =
    Encode.encode 0 (Encode.object pairs)


view : Model -> Browser.Document Msg
view model =
    { title = "Hello World - Elm19"
    , body =
        [ Html.text "Hello World!"
        , Html.node "intl-span"
            [ Attr.attribute "intl"
                (encodeIntl
                    [ ( "key", Encode.string "some.otherKey" )
                    ]
                )
            ]
            []
        ]
    }
