module Intl exposing (text, textInput)

import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


encodeIntl : List (List ( String, Value )) -> String
encodeIntl list =
    Encode.encode 0 (Encode.list Encode.object list)


text : String -> Value -> Value -> List (Html.Attribute msg) -> Html msg
text key formats values attrs =
    Html.node "intl-span"
        (attrs
            ++ [ Attr.attribute "intl"
                    (encodeIntl
                        [ [ ( "key", Encode.string key )
                          , ( "values", values )
                          , ( "formats", formats )
                          ]
                        ]
                    )
               ]
        )
        []


textInput : String -> Value -> Value -> List (Html.Attribute msg) -> Html msg
textInput key formats values attrs =
    Html.node "intl-text-input"
        (attrs
           ++ [ Attr.attribute "intl"
                  (encodeIntl
                      [ [ ( "key", Encode.string key )
                        , ( "values", values )
                        , ( "formats", formats )
                        , ( "attribute", Encode.string "placeholder" )
                        ]
                      , [ ( "key", Encode.string key )
                        , ( "values", values )
                        , ( "formats", formats )
                        , ( "attribute", Encode.string "title" )
                        ]
                      ]
                  )

             ]
        )
        []

