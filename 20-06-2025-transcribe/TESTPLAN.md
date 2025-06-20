# Test Plan for Audio Transcription Tool

## Overview

This test plan outlines the testing approach for the audio transcription tool, which transcribes audio, summarizes content, and extracts insights using OpenAI's Whisper and GPT models.

## Test Scope

The test plan covers:
- Unit testing of individual components
- Integration testing of the complete workflow
- Performance testing for larger files
- Error handling and recovery
- Edge cases and boundary conditions

## Test Environment

- Node.js (latest LTS version)
- Valid OpenAI API key with access to Whisper and GPT-4.1-mini models
- Sample audio files of various formats, lengths, and content types
- Testing tools: Jest for unit/integration tests, performance monitoring tools

## Test Categories

### 1. Unit Tests

#### File Handler Module
- **UT-FH-01**: Test ensureOutputDir creates directory when it doesn't exist
- **UT-FH-02**: Test generateFilename creates unique filenames with timestamps
- **UT-FH-03**: Test saveTranscription correctly saves content to file
- **UT-FH-04**: Test saveSummary correctly saves content to file
- **UT-FH-05**: Test saveAnalytics correctly saves JSON to file
- **UT-FH-06**: Test validateAudioFile correctly validates supported formats
- **UT-FH-07**: Test validateAudioFile correctly rejects non-existent files
- **UT-FH-08**: Test validateAudioFile correctly rejects unsupported formats

#### Analytics Module
- **UT-AN-01**: Test calculateWordCount correctly counts words
- **UT-AN-02**: Test calculateSpeakingSpeed correctly calculates WPM
- **UT-AN-03**: Test extractTopics returns proper topic structure
- **UT-AN-04**: Test getAudioDuration returns valid duration
- **UT-AN-05**: Test generateAnalytics returns complete analytics object

#### Transcription Module
- **UT-TR-01**: Test transcribeAudio successfully calls OpenAI API (with mocks)
- **UT-TR-02**: Test transcribeAudio handles API errors properly

#### Summarization Module
- **UT-SU-01**: Test summarizeTranscription successfully calls OpenAI API (with mocks)
- **UT-SU-02**: Test summarizeTranscription handles API errors properly

### 2. Integration Tests

- **IT-01**: End-to-end test with short audio file (~10s)
- **IT-02**: End-to-end test with medium audio file (~1m)
- **IT-03**: End-to-end test with longer audio file (~5m)
- **IT-04**: Test with different audio formats (mp3, wav, m4a)
- **IT-05**: Test with multi-language audio content
- **IT-06**: Test with poor audio quality
- **IT-07**: Test with background noise in audio
- **IT-08**: Test with multiple speakers in audio

### 3. Error Handling Tests

- **ET-01**: Test behavior when OpenAI API is unavailable
- **ET-02**: Test behavior with invalid API key
- **ET-03**: Test behavior when file exceeds size limits
- **ET-04**: Test behavior with corrupted audio files
- **ET-05**: Test retry mechanism for API failures
- **ET-06**: Test timeout handling for long processes
- **ET-07**: Test handling of API rate limits
- **ET-08**: Test behavior with network interruptions during API calls

### 4. Performance Tests

- **PT-01**: Measure execution time for different audio file sizes
- **PT-02**: Measure memory usage during processing
- **PT-03**: Assess API call efficiency and response times
- **PT-04**: Test concurrent executions
- **PT-05**: Evaluate performance with large files (>30m)

### 5. CLI Tests

- **CT-01**: Test CLI with valid arguments
- **CT-02**: Test CLI with missing arguments
- **CT-03**: Test CLI with invalid file path
- **CT-04**: Test CLI help command
- **CT-05**: Test CLI version command

## Test Cases

### Detailed Test Cases for Critical Functionality

#### IT-01: End-to-end test with short audio file

**Prerequisites:**
- Application is installed
- Valid OpenAI API key is configured
- Sample short audio file (~10s) is available

**Steps:**
1. Run command: `node src/index.js path/to/short-audio.mp3`
2. Wait for processing to complete

**Expected Results:**
1. Application runs without errors
2. Transcription file is created with accurate content
3. Summary file is created with meaningful summary
4. Analysis file is created with correct analytics
5. Console output shows summary and analytics
6. Processing completes in a reasonable timeframe (<30s)

#### ET-01: Test behavior when OpenAI API is unavailable

**Prerequisites:**
- Application is installed
- OpenAI API is unavailable (can be simulated with network blocking or mock)
- Sample audio file is available

**Steps:**
1. Run command: `node src/index.js path/to/audio.mp3`
2. Observe application behavior

**Expected Results:**
1. Application attempts to call API
2. After appropriate timeout/retries, application displays meaningful error
3. Error is logged with details
4. Process exits with non-zero status code
5. No partial/incomplete output files are left behind

## Test Data

### Sample Audio Files
1. **short_clear.mp3**: 10-second clip with clear single speaker
2. **medium_conversation.mp3**: 1-minute conversation between two people
3. **long_presentation.mp3**: 5-minute presentation with background noise
4. **multi_language.mp3**: Audio with multiple languages spoken
5. **poor_quality.mp3**: Audio with low quality/resolution
6. **heavy_accent.mp3**: Speech with strong accent
7. **background_noise.mp3**: Speech with significant background noise
8. **large_file.mp3**: 30+ minute audio file

## Testing Approach

### Manual Testing
- Initial functionality verification
- Exploratory testing for edge cases
- UI/UX assessment for console output

### Automated Testing
- Unit tests with Jest
- Integration tests with Jest and mock services
- Automated performance benchmarking

## Test Schedule

1. **Setup Phase**
   - Prepare test environment and sample data
   - Implement unit tests alongside development

2. **Development Testing**
   - Run unit tests during development of each module
   - Initial integration tests with simple files

3. **Integration Testing**
   - Full integration tests once all modules are complete
   - Error handling tests

4. **Performance Testing**
   - Run performance tests with varying file sizes and conditions

5. **Final Verification**
   - Complete end-to-end tests with all sample files
   - Verify all requirements are met

## Success Criteria

The testing is considered successful when:

1. All specified unit and integration tests pass successfully
2. The application correctly handles all error conditions gracefully
3. Performance meets acceptable standards:
   - Short files (<1m) process in under 60 seconds
   - Medium files (1-5m) process in under 3 minutes
   - Larger files (>5m) process in reasonable time proportional to length
4. The application meets all functional requirements specified in DESCRIPTION.md
5. Code coverage for unit tests exceeds 80%

## Reporting

Test results will be documented with:
- Test execution summary
- Passed/failed test cases
- Performance metrics
- Identified bugs or issues
- Recommendations for improvements

## Defect Management

For any defects found:
1. Document the issue with steps to reproduce
2. Categorize by severity (Critical, High, Medium, Low)
3. Assign for fixing
4. Verify fixes with regression testing

## Test Deliverables

1. Test plan document (this document)
2. Test cases and scripts
3. Test data (sample audio files)
4. Test execution reports
5. Defect reports
6. Final test summary report

## Appendix: Manual Test Checklist

### Installation Tests
- [ ] Fresh install on macOS
- [ ] Fresh install on Windows
- [ ] Fresh install on Linux
- [ ] Install with npm global flag
- [ ] Check dependencies resolution

### Functional Tests
- [ ] Process MP3 file
- [ ] Process WAV file
- [ ] Process M4A file
- [ ] Check transcription accuracy
- [ ] Verify summary quality
- [ ] Validate analytics data format
- [ ] Validate analytics data accuracy

### Error Recovery Tests
- [ ] Temporarily disable network during API call
- [ ] Run with invalid API key
- [ ] Run with unsupported file format
- [ ] Run with non-existent file
- [ ] Run with corrupted audio file 