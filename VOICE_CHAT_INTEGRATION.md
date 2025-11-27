# Voice Chat Integration

## Overview
Added voice conversation capability to the main chat interface, allowing users to speak their workflow descriptions instead of typing.

## Features Added

### 1. Microphone Button
- **Location**: Left side of the input box
- **Design**: Circular button with gradient background
- **States**:
  - **Idle**: Blue/purple gradient with microphone icon
  - **Recording**: Red background with pulsing animation
  - **Hover**: Scales up with shadow effect

### 2. Voice Recording
- **Audio Format**: WebM with Opus codec
- **Sample Rate**: 48kHz
- **Features**:
  - Echo cancellation
  - Noise suppression
  - Real-time recording indicator
  - Recording timer display

### 3. Speech-to-Text Integration
- **API Endpoint**: `/api/speech/transcribe`
- **Process Flow**:
  1. User clicks microphone button
  2. Browser requests microphone permission
  3. Audio recording starts
  4. User clicks microphone again to stop
  5. Audio is converted to base64
  6. Sent to speech-to-text API
  7. Transcribed text appears in input box
  8. User can edit before sending

### 4. User Experience
- **Visual Feedback**:
  - Pulsing red button during recording
  - Recording indicator dot
  - Timer showing recording duration
  - Status messages for processing
  
- **Error Handling**:
  - Microphone permission denied
  - Transcription failures
  - No speech detected
  - Network errors

## UI Components

### Microphone Button
```html
<button class="mic-button" id="mic-button" onclick="toggleVoiceRecording()">
    <span class="mic-icon">🎤</span>
    <div class="recording-indicator"></div>
</button>
```

### Voice Status Bar
```html
<div class="voice-status" id="voice-status">
    <span id="voice-status-text">Recording...</span>
    <span id="voice-timer">0:00</span>
</div>
```

## CSS Styling

### Key Styles
- `.mic-button` - Main microphone button
- `.mic-button.recording` - Recording state with pulse animation
- `.recording-indicator` - Red dot indicator
- `.voice-status` - Status bar below input
- Animations: `pulse`, `micPulse`, `blink`

### Responsive Design
- Button positioned absolutely within input wrapper
- Input box padding adjusted to accommodate mic button
- Works on mobile and desktop

## JavaScript Functions

### Core Functions

#### `toggleVoiceRecording()`
Toggles between start and stop recording states.

#### `startRecording()`
- Requests microphone access
- Creates MediaRecorder instance
- Starts audio capture
- Updates UI to recording state
- Starts timer

#### `stopRecording()`
- Stops MediaRecorder
- Updates UI to idle state
- Stops timer
- Triggers processing

#### `processRecording()`
- Creates audio blob from chunks
- Converts to base64
- Calls speech-to-text API
- Handles transcription result
- Updates input box with text

#### `updateRecordingUI(recording)`
Updates UI elements based on recording state.

#### `startRecordingTimer()` / `stopRecordingTimer()`
Manages the recording duration timer.

## API Integration

### Request Format
```javascript
{
    audioData: "base64_encoded_audio",
    format: "webm",
    sampleRate: 48000,
    channels: 1
}
```

### Response Format
```javascript
{
    text: "transcribed text",
    confidence: 0.95,
    segments: [...],
    language: "en-US"
}
```

## User Flow

1. **Start Recording**
   - User clicks microphone button
   - Browser prompts for microphone permission (first time)
   - Button turns red and starts pulsing
   - Timer starts counting
   - Status bar shows "Recording..."

2. **During Recording**
   - User speaks their workflow description
   - Visual feedback shows recording is active
   - Timer displays elapsed time

3. **Stop Recording**
   - User clicks microphone button again
   - Recording stops
   - System message: "🎤 Processing your voice input..."

4. **Transcription**
   - Audio sent to speech-to-text API
   - Transcribed text appears in input box
   - System message: "✅ Transcribed: [text]"
   - Send button becomes enabled

5. **Review & Send**
   - User can edit transcribed text if needed
   - Click send button to submit
   - Conversation continues normally

## Error Handling

### Microphone Access Denied
```
"Failed to access microphone. Please check permissions."
```

### No Speech Detected
```
"No speech detected. Please try again."
```

### Transcription Failed
```
"Failed to transcribe audio. Please try again or type your message."
```

### Network Error
```
"Failed to process recording. Please try again."
```

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (Chromium) - Full support
- ✅ Firefox - Full support
- ✅ Safari - Full support (iOS 14.3+)
- ✅ Opera - Full support

### Required APIs
- `navigator.mediaDevices.getUserMedia()`
- `MediaRecorder API`
- `FileReader API`
- `Blob API`

## Testing

### Manual Testing Steps
1. Open chat interface: `http://localhost:3000/new`
2. Click microphone button
3. Allow microphone access when prompted
4. Speak a test message
5. Click microphone button to stop
6. Verify transcribed text appears in input box
7. Edit if needed and send

### Test Cases
- ✅ Start/stop recording
- ✅ Microphone permission handling
- ✅ Audio transcription
- ✅ Text insertion into input box
- ✅ Error handling
- ✅ UI state management
- ✅ Timer functionality

## Configuration

### Audio Settings
Can be adjusted in `startRecording()`:
```javascript
audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 48000
}
```

### MediaRecorder Options
```javascript
{
    mimeType: 'audio/webm;codecs=opus'
}
```

## Performance

### Audio Quality
- **Sample Rate**: 48kHz (high quality)
- **Codec**: Opus (efficient compression)
- **Format**: WebM (widely supported)

### File Size
- Approximately 6KB per second of audio
- 30 seconds ≈ 180KB
- 60 seconds ≈ 360KB

### Processing Time
- Recording: Real-time
- Transcription: 1-3 seconds (depends on audio length)
- Total: ~2-5 seconds from stop to text

## Accessibility

### Keyboard Support
- Microphone button is keyboard accessible
- Can be triggered with Enter/Space when focused

### Screen Readers
- Button has descriptive title attribute
- Status messages announced via system messages
- Visual indicators have text equivalents

### Mobile Support
- Touch-friendly button size (48x48px)
- Works on iOS and Android
- Responsive layout

## Future Enhancements

### Potential Improvements
1. **Real-time Transcription**: Show text as user speaks
2. **Voice Commands**: "Send message", "Clear input"
3. **Language Selection**: Choose transcription language
4. **Audio Playback**: Review recording before transcription
5. **Waveform Visualization**: Show audio levels during recording
6. **Push-to-Talk**: Hold button to record, release to stop
7. **Voice Activity Detection**: Auto-stop when user stops speaking

## Troubleshooting

### Microphone Not Working
1. Check browser permissions
2. Verify microphone is connected
3. Test in browser settings
4. Try different browser

### Transcription Errors
1. Check API endpoint is running
2. Verify authentication token
3. Check network connectivity
4. Review browser console for errors

### Poor Transcription Quality
1. Reduce background noise
2. Speak clearly and at moderate pace
3. Check microphone quality
4. Adjust audio settings

## Files Modified

### `public/index-new.html`
- Added microphone button HTML
- Added voice status bar HTML
- Added CSS for voice components
- Added JavaScript voice recording functions
- Updated input box padding for mic button

## Dependencies

### Browser APIs
- MediaDevices API
- MediaRecorder API
- FileReader API
- Blob API

### Backend Services
- Speech-to-text service
- `/api/speech/transcribe` endpoint

## Security Considerations

### Microphone Access
- Requires explicit user permission
- Permission persists per origin
- Can be revoked in browser settings

### Data Privacy
- Audio processed server-side
- Not stored permanently (unless configured)
- Transcription happens in real-time
- No audio playback to third parties

## Conclusion

Voice chat integration provides a natural, efficient way for users to describe their workflows. The implementation is robust, user-friendly, and integrates seamlessly with the existing chat interface.

Users can now choose between typing and speaking, making the SOP creation process more accessible and efficient.
