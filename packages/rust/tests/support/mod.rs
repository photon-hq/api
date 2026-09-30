//! Name the generated types a test needs by the client method that uses them, not by the name the
//! generator derives for them. Type names follow the contract's component names, so a test written
//! this way keeps checking the same wire behaviour when the contract names its schemas.
#![allow(dead_code)]

use std::any::TypeId;
use std::future::Future;
use std::marker::PhantomData;

use photon_ai_api::{Client, Error, ResponseValue};
use serde::{Serialize, de::DeserializeOwned};
use serde_json::Value;

/// A generated model type, named by where the API uses it.
pub struct Model<T>(PhantomData<T>);

impl<T: DeserializeOwned + Serialize + 'static> Model<T> {
    pub fn decode(&self, value: Value) -> Result<T, serde_json::Error> {
        serde_json::from_value(value)
    }

    pub fn type_id(&self) -> TypeId {
        TypeId::of::<T>()
    }

    /// Absent, `null` and a value round-trip unchanged; a boolean is rejected.
    pub fn round_trips_optional_nullable(&self, base: Value, field: &str, value: Value) {
        let missing = self.decode(base.clone()).unwrap();
        assert_eq!(serde_json::to_value(missing).unwrap(), base);
        for supplied in [Value::Null, value] {
            let mut wire = base.clone();
            wire[field] = supplied;
            let model = self.decode(wire.clone()).unwrap();
            assert_eq!(serde_json::to_value(model).unwrap(), wire);
        }
        let mut invalid = base;
        invalid[field] = Value::Bool(true);
        assert!(self.decode(invalid).is_err(), "{field}");
    }
}

/// The request-body type of the client method `call` invokes.
pub fn request<T, F>(_call: F) -> Model<T>
where
    F: for<'a> Fn(&'a Client, &'a T),
{
    Model(PhantomData)
}

/// The success type of the client method `call` invokes.
pub fn response<T, E, F, Fut>(_call: F) -> Model<T>
where
    F: Fn(&'static Client) -> Fut,
    Fut: Future<Output = Result<ResponseValue<T>, Error<E>>>,
{
    Model(PhantomData)
}

/// The payload type of one variant of an operation's error enum, given the variant constructor
/// (`AssignSmsLineCampaignError::Status400`).
pub fn error_payload<T, E>(_variant: fn(Box<T>) -> E) -> Model<T> {
    Model(PhantomData)
}

/// The component a client method's request body references in `openapi/sdk.json`.
pub fn request_component(operation_id: &str) -> String {
    let path = concat!(env!("CARGO_MANIFEST_DIR"), "/../../openapi/sdk.json");
    let document: Value = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    for item in document["paths"].as_object().unwrap().values() {
        for operation in item.as_object().unwrap().values() {
            if operation["operationId"] == operation_id {
                let content = operation["requestBody"]["content"].as_object().unwrap();
                let media = content.values().next().unwrap();
                return media["schema"]["$ref"].as_str().unwrap().to_owned();
            }
        }
    }
    panic!("no operation {operation_id}");
}
