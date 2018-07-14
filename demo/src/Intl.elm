module Intl
    exposing
        ( Spec
        , context
        , element
        , mapAttribute
        , mapFormats
        , mapValues
        , spec
        , text
        )

import Html exposing (Html)
import Html.Attributes as Attr
import Json.Decode as Decode exposing (Value)
import Json.Encode as Encode


type Spec
    = Spec
        { attribute : Maybe String
        , formats : Value
        , key : String
        , values : Value
        }


context : List (Html msg) -> Html msg
context =
    Html.node "intl-context" []


element : List Spec -> Html msg -> Html msg
element specs child =
    let
        specToIntl (Spec { attribute, formats, key, values }) =
            case attribute of
                Just attr ->
                    [ ( "attribute", Encode.string attr )
                    , ( "formats", formats )
                    , ( "key", Encode.string key )
                    , ( "values", values )
                    ]

                Nothing ->
                    [ ( "formats", formats )
                    , ( "key", Encode.string key )
                    , ( "values", values )
                    ]
    in
    Html.node "intl-element"
        [ Attr.attribute "intl" (encodeIntl (List.map specToIntl specs))
        ]
        [ child ]


encodeIntl : List (List ( String, Value )) -> String
encodeIntl list =
    Encode.encode 0 (Encode.list Encode.object list)


mapAttribute : String -> Spec -> Spec
mapAttribute attribute (Spec base) =
    Spec { base | attribute = Just attribute }


mapFormats : Value -> Spec -> Spec
mapFormats formats (Spec base) =
    Spec { base | formats = formats }


mapValues : Value -> Spec -> Spec
mapValues values (Spec base) =
    Spec { base | values = values }


spec : String -> Spec
spec key =
    Spec
        { attribute = Nothing
        , formats = Encode.object []
        , key = key
        , values = Encode.object []
        }


text : Spec -> Html msg
text s =
    element [ s ] (Html.text "")
