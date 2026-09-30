//! Keep these wire-behavior checks identical for staging models and public aliases.
mod support;

use photon_ai_api::AssignSmsLineCampaignError;
use serde_json::{Value, json};
use support::{error_payload, request, request_component, response};

#[test]
fn request_types_are_distinct_unless_the_contract_shares_the_component() {
    // Model sharing must never merge two request types the contract keeps apart: equal wire
    // shapes do not make two inputs interchangeable. They are one type only when the contract
    // references one component.
    let mut checked = 0;
    for (first, second, first_id, second_id) in [
        (
            "beginOrganizationAuthentication",
            "beginOrganizationSsoAdmission",
            request(|client, body| {
                drop(client.begin_organization_authentication(String::new(), body))
            })
            .type_id(),
            request(|client, body| {
                drop(client.begin_organization_sso_admission(String::new(), body))
            })
            .type_id(),
        ),
        (
            "commitAccountProfilePicture",
            "commitAgentProfileAvatar",
            request(|client, body| {
                drop(client.commit_account_profile_picture(String::new(), body))
            })
            .type_id(),
            request(|client, body| {
                drop(client.commit_agent_profile_avatar(String::new(), String::new(), body))
            })
            .type_id(),
        ),
        (
            "createAccountProfilePictureUpload",
            "createAgentProfileAvatarUpload",
            request(|client, body| drop(client.create_account_profile_picture_upload(body)))
                .type_id(),
            request(|client, body| {
                drop(client.create_agent_profile_avatar_upload(String::new(), body))
            })
            .type_id(),
        ),
        (
            "cancelSubscription",
            "resumeSubscription",
            request(|client, body| {
                drop(client.cancel_subscription(String::new(), String::new(), None, body))
            })
            .type_id(),
            request(|client, body| {
                drop(client.resume_subscription(String::new(), String::new(), None, body))
            })
            .type_id(),
        ),
        (
            "updateAccount",
            "updateAgentProfile",
            request(|client, body| drop(client.update_account(String::new(), body))).type_id(),
            request(|client, body| {
                drop(client.update_agent_profile(String::new(), String::new(), body))
            })
            .type_id(),
        ),
        (
            "configureVoiceProfileOutbound",
            "updateVoiceProfileOutboundAuthentication",
            request(|client, body| {
                drop(client.configure_voice_profile_outbound(
                    String::new(),
                    String::new(),
                    String::new(),
                    body,
                ))
            })
            .type_id(),
            request(|client, body| {
                drop(client.update_voice_profile_outbound_authentication(
                    String::new(),
                    String::new(),
                    body,
                ))
            })
            .type_id(),
        ),
    ] {
        let shared = request_component(first) == request_component(second);
        assert_eq!(first_id == second_id, shared, "{first} / {second}");
        checked += 1;
    }
    assert_eq!(checked, 6);
}

#[test]
fn response_header_names_preserve_parsing_missing_values_and_errors() {
    use photon_ai_api::DeleteAccountStatus200Headers;
    use photon_ai_api::RotateWebhookSigningSecretStatus422Headers;
    use reqwest::header::{HeaderMap, HeaderValue};

    let mut headers = HeaderMap::new();
    assert!(
        DeleteAccountStatus200Headers::from_headers(&headers)
            .unwrap()
            .x_request_id
            .is_none()
    );
    assert!(
        RotateWebhookSigningSecretStatus422Headers::from_headers(&headers)
            .unwrap()
            .x_request_id
            .is_none()
    );
    headers.insert("X-Request-ID", HeaderValue::from_static("fixture-request"));
    headers.insert("Idempotent-Replayed", HeaderValue::from_static("true"));
    headers.insert("Sunset", HeaderValue::from_static("2026-10-01T00:00:00Z"));
    let account = DeleteAccountStatus200Headers::from_headers(&headers).unwrap();
    let webhook = RotateWebhookSigningSecretStatus422Headers::from_headers(&headers).unwrap();
    assert_eq!(account.x_request_id.as_deref(), Some("fixture-request"));
    assert_eq!(webhook.x_request_id, account.x_request_id);
    assert_eq!(account.idempotent_replayed, Some(true));
    assert_eq!(webhook.idempotent_replayed, account.idempotent_replayed);
    assert!(account.sunset.is_some());
    assert_eq!(webhook.sunset, account.sunset);

    headers.insert(
        "Idempotent-Replayed",
        HeaderValue::from_static("invalid-bool"),
    );
    assert!(DeleteAccountStatus200Headers::from_headers(&headers).is_err());
    assert!(RotateWebhookSigningSecretStatus422Headers::from_headers(&headers).is_err());
    headers.remove("Idempotent-Replayed");
    headers.insert("X-Request-ID", HeaderValue::from_bytes(&[0xff]).unwrap());
    assert!(DeleteAccountStatus200Headers::from_headers(&headers).is_err());
    assert!(RotateWebhookSigningSecretStatus422Headers::from_headers(&headers).is_err());
}

#[test]
fn requests_and_nested_enums_preserve_strict_json() {
    let admission =
        request(|client, body| drop(client.begin_organization_sso_admission(String::new(), body)));
    let wire = json!({"returnTo": "https://example.com/return"});
    assert_eq!(
        serde_json::to_value(admission.decode(wire.clone()).unwrap()).unwrap(),
        wire
    );
    for invalid in [json!({}), json!({"returnTo": 42})] {
        assert!(admission.decode(invalid).is_err());
    }
    // A member the closed schema does not declare is ignored, not an error.
    let extra = json!({"returnTo": "https://example.com/return", "extra": true});
    assert_eq!(
        serde_json::to_value(admission.decode(extra).unwrap()).unwrap(),
        wire
    );

    let upload = request(|client, body| {
        drop(client.create_agent_profile_avatar_upload(String::new(), body))
    });
    let wire = json!({"contentType": "image/png"});
    assert_eq!(
        serde_json::to_value(upload.decode(wire.clone()).unwrap()).unwrap(),
        wire
    );
    assert!(upload.decode(json!({"contentType": "unknown"})).is_err());
}

#[test]
fn response_models_keep_required_fields_and_ignore_undeclared_members() {
    let count = response(|client| client.count_projects(String::new(), None));
    let response = count.decode(json!({"count": 3})).unwrap();
    assert_eq!(response.count, 3);
    assert_eq!(serde_json::to_value(response).unwrap(), json!({"count": 3}));
    for invalid in [json!({}), json!({"count": "three"}), Value::Null] {
        assert!(count.decode(invalid).is_err());
    }
    // The contract closes this response with additionalProperties: false; a member added later
    // is still ignored rather than failing the call.
    let later = count
        .decode(json!({"count": 3, "futureField": true}))
        .unwrap();
    assert_eq!(serde_json::to_value(later).unwrap(), json!({"count": 3}));
}

#[test]
fn response_enums_accept_values_added_later() {
    let resource = response(|client| client.get_resource(String::new(), String::new()));
    let wire = json!({
        "abilities": ["messaging"],
        "createdAt": "2026-01-01T00:00:00.000Z",
        "detail": {},
        "projectId": "project",
        "resourceId": "resource",
        "state": "active",
        "type": "phone_number",
        "updatedAt": "2026-01-01T00:00:00.000Z",
    });
    let known = serde_json::to_value(resource.decode(wire.clone()).unwrap()).unwrap();
    assert_eq!(known["state"], "active");
    // A state the service adds later is kept, and a member this SDK does not know is ignored.
    let mut later = wire.clone();
    later["state"] = json!("suspended");
    later["futureField"] = json!({"a": [1]});
    let decoded = serde_json::to_value(resource.decode(later).unwrap()).unwrap();
    assert_eq!(decoded["state"], "suspended");
    assert_eq!(decoded.get("futureField"), None);
    let mut invalid = wire;
    invalid["state"] = json!(1);
    assert!(resource.decode(invalid).is_err());
}

#[test]
fn problem_unions_keep_wire_tags_and_reject_unknown_codes() {
    let wire = json!({
        "code": "IDEMPOTENCY_KEY_REQUIRED",
        "status": 400,
        "title": "Idempotency Key Required",
        "type": "https://photon.codes/docs/problems/idempotency-key-required",
    });
    let problems = error_payload(AssignSmsLineCampaignError::Status400);
    let decoded = problems.decode(wire.clone()).unwrap();
    assert_eq!(serde_json::to_value(decoded).unwrap(), wire);

    let mut invalid = wire;
    invalid["code"] = json!("UNKNOWN_ERROR_CODE");
    assert!(problems.decode(invalid).is_err());
}

#[test]
fn request_fields_reject_null_when_the_contract_forbids_it() {
    let account = request(|client, body| drop(client.update_account(String::new(), body)));
    let omitted = account.decode(json!({})).unwrap();
    assert_eq!(serde_json::to_value(omitted).unwrap(), json!({}));
    let supplied = account.decode(json!({"firstName": "Example"})).unwrap();
    assert_eq!(
        serde_json::to_value(supplied).unwrap(),
        json!({"firstName": "Example"})
    );
    assert!(account.decode(json!({"firstName": null})).is_err());

    let inbound = request(|client, body| {
        drop(client.update_voice_profile_inbound(String::new(), String::new(), body))
    });
    for invalid in [
        json!({}),
        json!({"expectedVersion": null}),
        json!({"expectedVersion": 1, "destinationUri": null}),
        json!({"expectedVersion": 1, "credentials": {"username": "test-only", "password": null}}),
    ] {
        assert!(inbound.decode(invalid).is_err());
    }
}

#[test]
fn nested_required_nullable_request_fields_must_be_present() {
    let assignments = request(|client, body| {
        drop(client.batch_update_voice_line_profile_assignments(String::new(), body))
    });
    for profile_id in [Value::Null, json!("test-profile")] {
        let wire = json!({"updates": [{
            "expectedVersion": 1,
            "profileId": profile_id,
            "resourceId": "test-resource"
        }]});
        let model = assignments.decode(wire.clone()).unwrap();
        assert_eq!(serde_json::to_value(model).unwrap(), wire);
    }
    let missing = json!({"updates": [{
        "expectedVersion": 1,
        "resourceId": "test-resource"
    }]});
    assert!(assignments.decode(missing).is_err());
}

#[test]
fn optional_nullable_requests_preserve_absent_null_and_value() {
    let inbound = request(|client, body| {
        drop(client.update_voice_profile_inbound(String::new(), String::new(), body))
    });
    inbound.round_trips_optional_nullable(
        json!({"expectedVersion":1}),
        "credentials",
        json!({"username":"test-only","password":"test-only"}),
    );
    request(|client, body| drop(client.update_account(String::new(), body)))
        .round_trips_optional_nullable(json!({}), "lastName", json!("Example"));
    request(|client, body| drop(client.update_agent_profile(String::new(), String::new(), body)))
        .round_trips_optional_nullable(json!({}), "lastName", json!("Example"));
    request(|client, body| {
        drop(client.update_webhook_destination(String::new(), String::new(), String::new(), body))
    })
    .round_trips_optional_nullable(json!({}), "description", json!("Example"));

    // Consumers can also set an explicit clear directly without JSON conversion.
    let mut body = inbound.decode(json!({"expectedVersion":1})).unwrap();
    body.credentials = Some(None);
    assert_eq!(
        serde_json::to_value(body).unwrap(),
        json!({"expectedVersion":1,"credentials":null})
    );
}
