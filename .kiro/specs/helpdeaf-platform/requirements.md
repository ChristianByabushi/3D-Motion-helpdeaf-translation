# Requirements Document

## Introduction

HelpDeaf is a cloud-based AI platform that translates spoken and written African languages into real-time 3D sign language animations. The platform serves Deaf users in education, healthcare, and public services across Africa, targeting the five most spoken African languages: Arabic, Swahili, Hausa, Yoruba, and Oromo.

The system integrates three core AI components in a sequential pipeline:
1. **Automatic Speech Recognition (ASR)** — transcribes spoken audio input into text
2. **Neural Machine Translation (NMT)** — maps transcribed text to sign language glosses
3. **Motion Synthesis AI** — generates fluid, anatomically accurate 3D sign language animations from motion vectors

The platform exposes a backend API, a real-time WebSocket streaming pipeline, and a motion capture processing pipeline (BVH → glTF), all deployed on cloud infrastructure (AWS/GCP/Azure). The primary deliverable is a working prototype demonstrating end-to-end text/speech → 3D sign language animation in a web interface.

---

## Glossary

- **ASR_Service**: The Automatic Speech Recognition component that transcribes spoken audio into text.
- **NMT_Service**: The Neural Machine Translation component that maps transcribed text to sign language glosses.
- **Motion_Synthesizer**: The AI component that generates 3D skeletal animation data from sign language glosses and motion vectors.
- **Animation_Pipeline**: The processing pipeline that converts raw motion capture data (BVH format) into web-ready 3D animation assets (glTF format).
- **Translation_API**: The RESTful backend API that orchestrates the ASR → NMT → Motion_Synthesizer pipeline and serves results to clients.
- **Streaming_Service**: The WebSocket-based real-time delivery service that streams animation frames to web and mobile clients.
- **Gloss**: A written representation of a sign language word or phrase used as an intermediate representation between spoken/written language and 3D animation.
- **BVH**: Biovision Hierarchy — a motion capture file format encoding skeletal joint rotations and positions over time.
- **glTF**: GL Transmission Format — a 3D asset format optimized for web delivery, used as the output format for sign language animations.
- **Motion_Vector**: A high-dimensional spatial-temporal representation of body joint positions and rotations used to drive 3D avatar animation.
- **Avatar**: The 3D humanoid character model used to render sign language animations in the web interface.
- **Skeleton**: The hierarchical joint structure of the Avatar used for skeletal animation.
- **CDN**: Content Delivery Network — a distributed network of servers used to cache and deliver static animation assets with low latency.
- **Cache**: An in-memory or distributed store (e.g., Redis) used to store pre-computed translation and animation results.
- **Deaf_User**: A person with hearing loss who uses sign language as their primary communication modality and is the primary end-user of the HelpDeaf platform.
- **Supported_Language**: One of the five target African languages: Arabic, Swahili, Hausa, Yoruba, or Oromo.
- **Sign_Language**: A visual-gestural language used by Deaf communities; the target output modality of the platform.
- **Pose_Estimator**: An ML model that validates the anatomical plausibility of generated Motion_Vectors.
- **Quality_Scorer**: An ML model that evaluates the linguistic accuracy and fluency of generated sign language animations.
- **WebSocket_Connection**: A persistent, full-duplex TCP connection between a client and the Streaming_Service used for real-time animation delivery.
- **Animation_Frame**: A single time-step snapshot of Avatar joint positions and rotations, delivered as part of a streaming animation sequence.
- **Round_Trip_Latency**: The elapsed time from when a user submits input to when the first Animation_Frame is rendered in the client browser.
- **Phonological_Embedding**: A dense vector representation of phonological features extracted from speech audio by the ASR_Service.
- **Spatial_Temporal_Motion_Vector**: The high-dimensional output of the encoder-decoder framework encoding joint trajectories over time.

---

## Requirements

### Requirement 1: Speech Input Transcription

**User Story:** As a Deaf_User or hearing service provider, I want to speak in a Supported_Language and have my speech accurately transcribed, so that the platform can translate my spoken words into sign language.

#### Acceptance Criteria

1. WHEN an audio input in a Supported_Language is submitted to the Translation_API, THE ASR_Service SHALL transcribe the audio into UTF-8 encoded text within 2 seconds for audio segments up to 30 seconds in duration.
2. WHEN an audio input is submitted, THE ASR_Service SHALL return a confidence score between 0.0 and 1.0 alongside the transcribed text.
3. IF the submitted audio contains no detectable speech signal, THEN THE ASR_Service SHALL return an error response with error code `ASR_NO_SPEECH` and a human-readable message.
4. IF the submitted audio is in a language other than a Supported_Language, THEN THE ASR_Service SHALL return an error response with error code `ASR_UNSUPPORTED_LANGUAGE`.
5. THE ASR_Service SHALL support audio input in WAV, MP3, and OGG formats with sample rates of 16 kHz or higher.
6. WHEN audio input exceeds 30 seconds in duration, THE ASR_Service SHALL segment the audio into 30-second chunks and transcribe each chunk sequentially, returning a concatenated transcript.
7. THE ASR_Service SHALL produce transcriptions with a Word Error Rate (WER) of 20% or lower on a held-out benchmark dataset for each Supported_Language.

---

### Requirement 2: Text-to-Gloss Translation

**User Story:** As a system operator, I want transcribed text to be accurately mapped to sign language glosses, so that the Motion_Synthesizer can generate linguistically correct animations.

#### Acceptance Criteria

1. WHEN a transcribed text string in a Supported_Language is received by the NMT_Service, THE NMT_Service SHALL produce an ordered sequence of Glosses representing the sign language equivalent within 500 milliseconds.
2. THE NMT_Service SHALL preserve the semantic meaning of the source text in the output Gloss sequence, validated against a reference Gloss corpus with a BLEU score of 0.40 or higher.
3. IF the input text contains terms with no direct Gloss equivalent, THEN THE NMT_Service SHALL apply fingerspelling encoding for those terms and include a `fingerspelled` flag in the Gloss metadata.
4. WHEN the input text contains domain-specific vocabulary from healthcare or education contexts, THE NMT_Service SHALL resolve those terms using a domain-specific Gloss lexicon.
5. THE NMT_Service SHALL support direct text input (bypassing ASR) for users who prefer typed input.
6. IF the input text is empty or contains only whitespace, THEN THE NMT_Service SHALL return an error response with error code `NMT_EMPTY_INPUT`.
7. FOR ALL valid text inputs, translating a text string to Glosses and then back-translating the Glosses to text SHALL produce a semantically equivalent output, verified by a semantic similarity score of 0.75 or higher on a held-out test set (round-trip property).

---

### Requirement 3: 3D Sign Language Animation Generation

**User Story:** As a Deaf_User, I want sign language animations to be anatomically accurate and linguistically fluent, so that I can understand the communicated content without ambiguity.

#### Acceptance Criteria

1. WHEN an ordered Gloss sequence is received by the Motion_Synthesizer, THE Motion_Synthesizer SHALL generate a sequence of Spatial_Temporal_Motion_Vectors encoding joint trajectories for all 52 joints of the Avatar Skeleton.
2. THE Motion_Synthesizer SHALL produce animations at a minimum frame rate of 30 frames per second.
3. WHEN generating Motion_Vectors, THE Pose_Estimator SHALL validate that all joint angles remain within anatomically plausible ranges, rejecting any frame where a joint angle exceeds its defined physiological limit.
4. WHEN a generated animation is evaluated by the Quality_Scorer, THE Quality_Scorer SHALL assign a fluency score of 0.70 or higher on a 0.0–1.0 scale for animations to be accepted for delivery.
5. IF the Quality_Scorer assigns a fluency score below 0.70, THEN THE Motion_Synthesizer SHALL regenerate the animation up to 2 additional times before returning the highest-scoring result.
6. THE Motion_Synthesizer SHALL generate animations using an encoder-decoder architecture that projects Phonological_Embeddings into Spatial_Temporal_Motion_Vectors.
7. WHEN generating animations for a Gloss sequence longer than 50 Glosses, THE Motion_Synthesizer SHALL apply co-articulation smoothing between consecutive signs to produce fluid transitions.
8. FOR ALL valid Gloss sequences, encoding a Gloss sequence into Motion_Vectors and decoding the Motion_Vectors back into a Gloss sequence SHALL produce a Gloss sequence with a BLEU score of 0.60 or higher against the original (round-trip property).

---

### Requirement 4: Motion Capture Data Processing Pipeline

**User Story:** As a platform engineer, I want raw motion capture data to be automatically converted into web-ready 3D animation assets, so that sign language animations can be delivered efficiently to web and mobile clients.

#### Acceptance Criteria

1. WHEN a BVH file is submitted to the Animation_Pipeline, THE Animation_Pipeline SHALL convert it to a glTF 2.0 file retaining all joint hierarchy, rotation data, and timing information.
2. THE Animation_Pipeline SHALL complete BVH-to-glTF conversion for a 60-second motion capture recording within 30 seconds of submission.
3. WHEN converting BVH to glTF, THE Animation_Pipeline SHALL apply Draco mesh compression to reduce the output glTF file size by at least 60% compared to the uncompressed equivalent.
4. THE Animation_Pipeline SHALL validate that the output glTF file passes glTF 2.0 schema validation before marking the conversion as complete.
5. IF a BVH file contains malformed or missing joint data, THEN THE Animation_Pipeline SHALL return an error response with error code `PIPELINE_INVALID_BVH` identifying the affected joints.
6. THE Animation_Pipeline SHALL support batch processing of up to 50 BVH files submitted in a single request, processing them in parallel and returning a manifest of output glTF file locations.
7. FOR ALL valid BVH inputs, converting a BVH file to glTF and extracting joint rotation data from the glTF SHALL produce joint rotation values within a tolerance of ±0.001 radians of the original BVH values (round-trip property).
8. WHEN a converted glTF asset is stored, THE Animation_Pipeline SHALL upload it to cloud object storage and register its CDN URL in the asset registry.

---

### Requirement 5: Translation API

**User Story:** As a developer integrating HelpDeaf into an application, I want a well-defined RESTful API, so that I can submit text or audio and receive sign language animation data programmatically.

#### Acceptance Criteria

1. THE Translation_API SHALL expose a `POST /v1/translate` endpoint that accepts a JSON request body containing a `text` or `audio_url` field and a `source_language` field specifying a Supported_Language.
2. WHEN a valid request is received at `POST /v1/translate`, THE Translation_API SHALL orchestrate the ASR → NMT → Motion_Synthesizer pipeline and return a JSON response containing the Gloss sequence, animation asset URL, and pipeline metadata within 5 seconds for text input and 8 seconds for audio input.
3. THE Translation_API SHALL expose a `GET /v1/animations/{animation_id}` endpoint that returns the glTF asset URL, frame count, duration, and quality score for a previously generated animation.
4. THE Translation_API SHALL enforce authentication on all endpoints using API key validation, returning HTTP 401 for requests with missing or invalid API keys.
5. THE Translation_API SHALL enforce a rate limit of 100 requests per minute per API key, returning HTTP 429 with a `Retry-After` header when the limit is exceeded.
6. IF a pipeline component (ASR_Service, NMT_Service, or Motion_Synthesizer) returns an error, THEN THE Translation_API SHALL return an HTTP 502 response with a structured error body containing the `error_code`, `failed_component`, and `message` fields.
7. THE Translation_API SHALL log all requests with a unique `request_id`, timestamp, source language, input type, pipeline latency breakdown, and response status code.
8. THE Translation_API SHALL expose a `GET /v1/health` endpoint that returns the operational status of each pipeline component and overall system health within 200 milliseconds.
9. WHERE caching is enabled, THE Translation_API SHALL return cached animation results for identical input text and source language combinations, bypassing pipeline execution and returning within 100 milliseconds.

---

### Requirement 6: Real-Time WebSocket Streaming

**User Story:** As a Deaf_User, I want sign language animations to begin playing as quickly as possible after I submit input, so that I can follow conversations and content in real time without waiting for the full animation to load.

#### Acceptance Criteria

1. THE Streaming_Service SHALL expose a WebSocket endpoint at `wss://{host}/v1/stream` that accepts a connection initiation message containing `source_language`, `input_type` (`text` or `audio`), and an authentication token.
2. WHEN a WebSocket_Connection is established and input is submitted, THE Streaming_Service SHALL deliver the first Animation_Frame to the client within 1.5 seconds (Round_Trip_Latency).
3. THE Streaming_Service SHALL stream Animation_Frames at a rate of 30 frames per second, with each frame encoded as a binary message containing joint rotation quaternions for all 52 Avatar joints.
4. WHEN the animation sequence is complete, THE Streaming_Service SHALL send a terminal message with type `STREAM_END` containing the total frame count and quality score.
5. IF a WebSocket_Connection is interrupted, THEN THE Streaming_Service SHALL buffer up to 5 seconds of Animation_Frames and resume delivery from the last acknowledged frame upon reconnection within 10 seconds.
6. THE Streaming_Service SHALL support a minimum of 500 concurrent WebSocket_Connections per server instance without degrading frame delivery rate below 30 frames per second.
7. WHILE a streaming session is active, THE Streaming_Service SHALL send a heartbeat message every 15 seconds to maintain the WebSocket_Connection.
8. IF the Motion_Synthesizer has not produced the next Animation_Frame within 33 milliseconds of the previous frame delivery, THEN THE Streaming_Service SHALL interpolate the intermediate frame using linear interpolation of joint quaternions and flag it as `interpolated: true` in the frame metadata.

---

### Requirement 7: 3D Avatar Rendering in Web Interface

**User Story:** As a Deaf_User accessing HelpDeaf through a browser, I want to see a smooth, realistic 3D avatar performing sign language, so that I can read and understand the communicated content.

#### Acceptance Criteria

1. THE Web_Interface SHALL render the Avatar using a WebGL-based 3D renderer (Three.js or equivalent) at a minimum of 30 frames per second on devices with a GPU supporting WebGL 2.0.
2. WHEN Animation_Frames are received from the Streaming_Service, THE Web_Interface SHALL apply them to the Avatar Skeleton within one frame render cycle (33 milliseconds) to maintain synchronization.
3. THE Web_Interface SHALL provide playback controls including play, pause, rewind to start, and speed adjustment (0.5×, 1.0×, 1.5×).
4. THE Web_Interface SHALL display a text transcript of the source input alongside the Avatar animation, synchronized to the current animation timestamp.
5. WHEN the Avatar is rendered, THE Web_Interface SHALL apply ambient occlusion and directional lighting to produce a visually clear representation of hand shapes and body posture.
6. THE Web_Interface SHALL support responsive layout rendering correctly on viewport widths from 320px to 2560px.
7. IF the client device does not support WebGL 2.0, THEN THE Web_Interface SHALL display a fallback message indicating the browser requirement and provide a link to a compatible browser.
8. WHERE a user enables high-contrast mode, THE Web_Interface SHALL render the Avatar against a solid high-contrast background (minimum contrast ratio 7:1 per WCAG 2.1 AA).

---

### Requirement 8: Multi-Language Support

**User Story:** As a user in any of the five target regions, I want the platform to correctly handle my language's script, phonology, and grammar, so that translations are accurate for my community.

#### Acceptance Criteria

1. THE Translation_API SHALL accept input text encoded in UTF-8 for all Supported_Languages, including Arabic (right-to-left script), Swahili, Hausa, Yoruba (with diacritics), and Oromo (with extended Latin characters).
2. WHEN processing Arabic input, THE ASR_Service SHALL handle Modern Standard Arabic and common dialectal variants used in North Africa and the Horn of Africa.
3. THE NMT_Service SHALL maintain a separate Gloss lexicon for each Supported_Language, reflecting the distinct grammatical structures of each language's corresponding Sign_Language.
4. WHEN processing Yoruba input, THE ASR_Service SHALL correctly distinguish tonal phonemes (high, mid, low tones) that differentiate word meanings.
5. THE Translation_API SHALL accept a `source_language` parameter value from the set `["ar", "sw", "ha", "yo", "om"]` using ISO 639-1 and ISO 639-3 codes.
6. IF a `source_language` value outside the supported set is provided, THEN THE Translation_API SHALL return HTTP 400 with error code `UNSUPPORTED_LANGUAGE` and a list of supported language codes.

---

### Requirement 9: ML Model Integration and Versioning

**User Story:** As an ML engineer, I want to deploy, version, and swap ML models independently, so that I can improve model quality without disrupting the production pipeline.

#### Acceptance Criteria

1. THE Translation_API SHALL load ASR, NMT, and Motion_Synthesizer models from a model registry, identified by model name and semantic version string (e.g., `asr-swahili:v2.1.0`).
2. WHEN a new model version is registered, THE Translation_API SHALL support zero-downtime model hot-swapping by routing new requests to the updated model while in-flight requests complete on the previous version.
3. THE Translation_API SHALL expose a `GET /v1/models` endpoint listing all registered models, their versions, Supported_Languages, and current deployment status.
4. WHEN a model produces an output with a quality score below its configured minimum threshold, THE Translation_API SHALL log the failure with the model version, input hash, and quality score, and fall back to the previous stable model version.
5. THE Translation_API SHALL record inference latency, quality scores, and error rates per model version, accessible via a `GET /v1/models/{model_id}/metrics` endpoint.
6. IF a model fails to load from the registry within 30 seconds, THEN THE Translation_API SHALL return HTTP 503 with error code `MODEL_LOAD_TIMEOUT` and continue serving requests using the last successfully loaded model version.

---

### Requirement 10: Caching and Performance Optimization

**User Story:** As a platform engineer, I want frequently requested translations and animations to be served from cache, so that the system can handle high traffic volumes with low latency and reduced compute cost.

#### Acceptance Criteria

1. THE Translation_API SHALL implement a distributed Cache (Redis or equivalent) keyed on the SHA-256 hash of the normalized input text and source language code.
2. WHEN a cache hit occurs, THE Translation_API SHALL return the cached Gloss sequence and animation asset URL within 100 milliseconds without invoking the NMT_Service or Motion_Synthesizer.
3. THE Translation_API SHALL set a cache TTL of 24 hours for animation assets and 1 hour for Gloss sequences, configurable via environment variables.
4. WHEN an animation asset is first generated, THE Animation_Pipeline SHALL upload it to a CDN and store the CDN URL in the Cache, so that subsequent requests receive the CDN-served asset.
5. THE Translation_API SHALL achieve a cache hit rate of 40% or higher under a simulated workload of 1,000 requests using a realistic distribution of common phrases.
6. THE Streaming_Service SHALL pre-buffer the first 3 seconds of Animation_Frames before beginning delivery to the client, to reduce the probability of mid-stream stalls.
7. WHEN the Cache is unavailable, THE Translation_API SHALL continue serving requests by invoking the full pipeline, logging a `CACHE_UNAVAILABLE` warning, and returning results within the standard SLA.

---

### Requirement 11: Cloud Deployment and Scalability

**User Story:** As a platform operator, I want the system to scale automatically under variable load, so that Deaf users experience consistent performance during peak usage in education and healthcare settings.

#### Acceptance Criteria

1. THE Translation_API SHALL be deployed as containerized services (Docker) orchestrated by Kubernetes or an equivalent managed container service on AWS, GCP, or Azure.
2. WHEN request throughput exceeds 80% of the current instance capacity for 60 consecutive seconds, THE Translation_API SHALL trigger horizontal auto-scaling to add additional instances within 90 seconds.
3. THE Translation_API SHALL maintain a p95 response latency of 5 seconds or lower for text translation requests under a sustained load of 200 concurrent requests.
4. THE Streaming_Service SHALL maintain a p95 first-frame latency of 1.5 seconds or lower under a sustained load of 500 concurrent WebSocket_Connections.
5. THE Translation_API SHALL store all persistent data (animation assets, model artifacts, motion capture files) in cloud object storage with 99.9% availability SLA.
6. WHEN a service instance becomes unhealthy (failing health checks for 3 consecutive intervals of 10 seconds), THE orchestration layer SHALL terminate the instance and replace it with a new healthy instance.
7. THE Translation_API SHALL support blue-green deployment, allowing a new version to be deployed alongside the current version and traffic to be shifted without downtime.

---

### Requirement 12: Security and Access Control

**User Story:** As a platform operator, I want all API endpoints and data transmissions to be secured, so that user data and proprietary model assets are protected from unauthorized access.

#### Acceptance Criteria

1. THE Translation_API SHALL enforce TLS 1.2 or higher on all HTTP and WebSocket connections, rejecting connections that negotiate a lower protocol version.
2. THE Translation_API SHALL validate API keys against a secure credential store on every request, with key validation completing within 10 milliseconds.
3. WHEN an API key is used from an IP address not in its allowlist, THE Translation_API SHALL reject the request with HTTP 403 and log the attempt with the source IP, timestamp, and key identifier.
4. THE Translation_API SHALL store API keys as salted SHA-256 hashes and SHALL NOT store plaintext key values.
5. THE Animation_Pipeline SHALL store all motion capture source files and generated glTF assets in cloud object storage with server-side encryption (AES-256) enabled.
6. WHEN a user session ends, THE Streaming_Service SHALL invalidate the session token and close the WebSocket_Connection within 5 seconds.
7. THE Translation_API SHALL implement input sanitization on all text fields, rejecting inputs containing SQL injection patterns, script injection patterns, or inputs exceeding 10,000 characters, returning HTTP 400 with error code `INVALID_INPUT`.

---

### Requirement 13: Observability and Monitoring

**User Story:** As a platform engineer, I want comprehensive logging, metrics, and alerting, so that I can detect, diagnose, and resolve production issues before they impact Deaf users.

#### Acceptance Criteria

1. THE Translation_API SHALL emit structured JSON logs for every request, including `request_id`, `timestamp`, `source_language`, `input_type`, `pipeline_stage_latencies`, `model_versions`, and `response_status`.
2. THE Translation_API SHALL expose Prometheus-compatible metrics at `GET /metrics`, including request count, error rate, p50/p95/p99 latency, cache hit rate, and active WebSocket_Connection count.
3. WHEN the error rate for any pipeline component exceeds 5% over a 5-minute rolling window, THE Monitoring_System SHALL trigger an alert to the on-call engineer within 60 seconds.
4. WHEN Round_Trip_Latency exceeds 8 seconds for more than 1% of requests over a 5-minute window, THE Monitoring_System SHALL trigger a latency degradation alert.
5. THE Translation_API SHALL retain request logs for a minimum of 30 days in a searchable log store.
6. THE Translation_API SHALL produce distributed traces for each request spanning all pipeline components (ASR_Service, NMT_Service, Motion_Synthesizer), compatible with OpenTelemetry standards.

---

### Requirement 14: Demo Interface

**User Story:** As a stakeholder or evaluator, I want a working demo that shows end-to-end text and speech input being converted into sign language animations, so that I can validate the platform's capabilities.

#### Acceptance Criteria

1. THE Demo_Interface SHALL provide a text input field and a microphone button for audio input, both connected to the Translation_API.
2. WHEN a user submits text or audio input via the Demo_Interface, THE Demo_Interface SHALL display the Avatar performing the corresponding sign language animation within 5 seconds for text and 8 seconds for audio.
3. THE Demo_Interface SHALL display a language selector allowing the user to choose from all Supported_Languages before submitting input.
4. THE Demo_Interface SHALL display the transcribed text (for audio input), the Gloss sequence, and the animation quality score alongside the Avatar rendering.
5. THE Demo_Interface SHALL be accessible via a public HTTPS URL without requiring user registration.
6. THE Demo_Interface SHALL function correctly in the latest stable versions of Chrome, Firefox, Safari, and Edge browsers.
7. WHEN the Demo_Interface is loaded on a mobile device with a viewport width of 375px or greater, THE Demo_Interface SHALL render all interactive elements without horizontal scrolling.
